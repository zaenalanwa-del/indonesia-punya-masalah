# Vertical Slice v1

## Goal
Prove one complete user journey without requiring a production AI provider:

1. User asks a natural-language question.
2. Orchestrator extracts intent, location and time horizon.
3. Candidate observations are retrieved.
4. Sources are ranked by reliability/freshness.
5. Evidence is assembled and conflicts are surfaced.
6. A confidence score is calculated.
7. A structured answer is returned.
8. UI renders summary, evidence, uncertainty and next actions.

## Production replacement points
- `backend/orchestrator.py`: replace deterministic reasoning with model/tool orchestration.
- `sample_data/*.json`: replace with ingestion connectors.
- `sources`/`datasets` tables: register real licenses, access levels, update schedules and provenance.
- `answer_evidence` records: persist claim-to-evidence links.

## Safety rule
A social post, citizen report or search trend is a signal. It must not become a fact without corroboration.
