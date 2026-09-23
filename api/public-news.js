module.exports = async function handler(req,res){
  const sources=[
    {name:"ANTARA",type:"Media Nasional",url:"https://www.antaranews.com/rss/terkini.xml"},
    {name:"detikcom",type:"Media Nasional",url:"https://www.detik.com/"},
    {name:"BMKG",type:"Sumber Resmi",url:"https://www.bmkg.go.id/alerts/nowcast/id"},
    {name:"BNPB",type:"Sumber Resmi",url:"https://www.bnpb.go.id/"}
  ];
  const clean=s=>String(s||"").replace(/<!\[CDATA\[|\]\]>/g,"").replace(/<[^>]*>/g," ").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\\s+/g," ").trim();
  const tag=(xml,n)=>{const m=xml.match(new RegExp("<"+n+"[^>]*>([\\s\\S]*?)</"+n+">","i"));return clean(m&&m[1]);};
  async function fetchText(url){const r=await fetch(url,{headers:{"user-agent":"NuansaKita/1.0 public-news"}});if(!r.ok)throw new Error(String(r.status));return await r.text();}
  async function rss(name,type,url){
    const x=await fetchText(url), out=[], re=/<item[\\s\\S]*?<\\/item>/gi; const blocks=x.match(re)||[];
    for(const b of blocks.slice(0,12)){const title=tag(b,"title"),link=tag(b,"link"),date=tag(b,"pubDate"),desc=tag(b,"description");if(title&&link)out.push({source:name,type,title,link,published_at:date,description:desc});}
    return out;
  }
  async function html(name,type,url){
    const x=await fetchText(url),out=[]; 
    if(name==="detikcom"){
      const re=/<a[^>]+href=["'](https?:\\/\\/[^"']+)["'][^>]*>([\\s\\S]*?)<\\/a>/gi; let m;
      while((m=re.exec(x))&&out.length<15){const title=clean(m[2]);if(title&&title.length>25&&!/login|download|selengkapnya/i.test(title))out.push({source:name,type,title,link:m[1],published_at:"",description:"Berita terbaru dari detikcom"});}
    } else if(name==="BNPB"){
      const re=/<a[^>]+href=["']([^"']*\\/berita\\/[^"']+)["'][^>]*>([\\s\\S]*?)<\\/a>/gi; let m;
      while((m=re.exec(x))&&out.length<12){const title=clean(m[2]);if(title&&title.length>20)out.push({source:name,type,title,link:new URL(m[1],url).href,published_at:"",description:"Informasi terbaru BNPB"});}
    }
    return out;
  }
  try{
    const results=[];
    for(const s of sources){try{results.push(...(s.name==="ANTARA"?await rss(s.name,s.type,s.url):s.name==="BMKG"?await rss(s.name,s.type,s.url):await html(s.name,s.type,s.url)))}catch(e){}}
    const seen=new Set(),items=results.filter(x=>{const k=x.source+"|"+x.title;if(seen.has(k))return false;seen.add(k);return true;});
    items.sort((a,b)=>new Date(b.published_at||0)-new Date(a.published_at||0));
    res.setHeader("Cache-Control","s-maxage=300, stale-while-revalidate=600");
    res.setHeader("Access-Control-Allow-Origin","*");
    return res.status(200).json({ok:true,updated_at:new Date().toISOString(),items:items.slice(0,40)});
  }catch(e){return res.status(502).json({ok:false,error:"news_feed_unavailable"});}
};