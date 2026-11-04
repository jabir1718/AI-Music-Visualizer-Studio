 }
};
function initArtworkLayers(){if(window.WaveForgeArtworkLayers)window.WaveForgeArtworkLayers.mount($('artworkLayerPanel'),{saveMediaAsset,getMediaAsset,deleteMediaAsset,onChange:saveSettings});}
function initAutoVideoEditor(){if(window.WaveForgeAutoVideo)window.WaveForgeAutoVideo.mount($('autoVideoPanel'),{saveMediaAsset,getMediaAsset,deleteMediaAsset,onChange:saveSettings,getBpm:()=>manualBpm||0,detectBpm:async onProgress=>{if(!audioFile)throw new Error('Import your main song first so Auto Cut can analyse its real tempo.');const result=await WaveForgeBPM.detect(audioFile,onProgress);manualBpm=result.bpm;tapBeatOffset=0;lastGridBeat=-1;updateBeatGridInputs();saveSettings();return result;},getMusicDuration:()=>audio.duration||0});}
function initOfflineEditAssistant(){if(window.WaveForgeOfflineAssistant)window.WaveForgeOfflineAssistant.mount(document.querySelector('.workspace'),{onApply:saveSettings,getAutoVideo:()=>window.WaveForgeAutoVideo});}
