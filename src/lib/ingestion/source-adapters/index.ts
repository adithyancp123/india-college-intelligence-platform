import { fetchUGCRegistry } from './ugc.adapter';
import { fetchNIRFRankings } from './nirf.adapter';
import { fetchAICTERegistry } from './aicte.adapter';
import { fetchDataGovStats } from './dataset.adapter';

export { fetchUGCRegistry } from './ugc.adapter';
export { fetchNIRFRankings } from './nirf.adapter';
export { fetchAICTERegistry } from './aicte.adapter';
export { fetchDataGovStats } from './dataset.adapter';

export async function fetchHybridDataset() {
  console.log('Initiating parallel hybrid ingestion fetches in modular adapter layer...');
  const [ugc, nirf, aicte, datagov] = await Promise.all([
    fetchUGCRegistry(),
    fetchNIRFRankings(),
    fetchAICTERegistry(),
    fetchDataGovStats()
  ]);

  return {
    ugc: ugc.data,
    nirf: nirf.data,
    aicte: aicte.data,
    datagov: datagov.data,
    sources: [ugc.source, nirf.source, aicte.source, datagov.source],
    isFullFallback: ugc.isFallback && nirf.isFallback && aicte.isFallback && datagov.isFallback
  };
}
