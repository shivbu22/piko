// Nook — Liquid Glass Settings & Preferences Panel
// 100% Local privacy configuration, audio settings, and model toggles

import React, { useState } from 'react';
import { storage } from '../storage/StorageEngine';
import { sounds } from '../audio/SoundEffects';
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  Cpu, 
  Folder, 
  RefreshCw, 
  Check,
  Laptop,
  Smartphone
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  isHardwareNotch: boolean;
  onToggleHardwareNotch: (isHardware: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  isHardwareNotch,
  onToggleHardwareNotch,
}) => {
  const currentSettings = storage.getSettings();
  const [soundEnabled, setSoundEnabled] = useState<boolean>(!sounds.getMuted());
  const [wakeWordEnabled, setWakeWordEnabled] = useState<boolean>(currentSettings.wakeWordEnabled ?? true);
  const [selectedWhisperModel, setSelectedWhisperModel] = useState<string>(currentSettings.whisperModel || 'ggml-base.en');
  const [selectedOllamaModel, setSelectedOllamaModel] = useState<string>(currentSettings.ollamaModel || 'llama3.2:3b');
  const [vaultPath, setVaultPath] = useState<string>(currentSettings.obsidianVaultPath || '~/Documents/Obsidian/WorkVault/Meetings');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = () => {
    sounds.playPop();
    sounds.setMuted(!soundEnabled);

    storage.saveSettings({
      notchMode: isHardwareNotch ? 'hardware' : 'floating',
      soundEffectsEnabled: soundEnabled,
      wakeWordEnabled,
      whisperModel: selectedWhisperModel,
      ollamaModel: selectedOllamaModel,
      obsidianVaultPath: vaultPath,
      autoExportToMarkdown: true,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleResetData = () => {
    if (confirm('Reset to standard seed meetings?')) {
      storage.resetToDefaults();
      sounds.playChime();
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-full text-text-primary select-none p-1">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            Nook Preferences & System
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-status-success-green/20 text-status-success-green border border-status-success-green/30">
              Zero Telemetry
            </span>
          </h3>
          <p className="text-[11px] text-text-secondary">
            Local hardware configuration • v3.0 Production Build
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-coral hover:bg-accent-coral-active text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
          {savedSuccess ? 'Saved' : 'Save Changes'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1 max-h-[360px]">
        {/* Section 1: Notch Geometry Mode */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            Display Notch Alignment
          </label>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onToggleHardwareNotch(true)}
              className={`p-2.5 rounded-lg border text-left transition-all active:scale-95 ${
                isHardwareNotch
                  ? 'bg-accent-coral/15 border-accent-coral text-white'
                  : 'bg-white/5 border-white/10 text-text-secondary hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 font-semibold text-xs">
                <Laptop className="w-3.5 h-3.5 text-accent-coral" />
                MacBook Notch
              </div>
              <p className="text-[10px] text-text-tertiary">
                Docked flush at top:0 with G2 Bézier fillet ears into screen bezel.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onToggleHardwareNotch(false)}
              className={`p-2.5 rounded-lg border text-left transition-all active:scale-95 ${
                !isHardwareNotch
                  ? 'bg-accent-coral/15 border-accent-coral text-white'
                  : 'bg-white/5 border-white/10 text-text-secondary hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 font-semibold text-xs">
                <Smartphone className="w-3.5 h-3.5 text-accent-coral" />
                Dynamic Island
              </div>
              <p className="text-[10px] text-text-tertiary">
                Floating pill with 360° continuous squircle curvature and caustic rim.
              </p>
            </button>
          </div>
        </div>

        {/* Section 2: Audio & Mascot Interaction */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-3">
          <label className="text-xs font-bold text-white">Audio & Spatial Feedback</label>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-accent-coral" />
              ) : (
                <VolumeX className="w-4 h-4 text-text-tertiary" />
              )}
              <div>
                <p className="text-xs font-medium text-white">Spatial Sound Effects</p>
                <p className="text-[10px] text-text-tertiary">
                  Synthesized WebAudio chimes for notch pop, recording chimes, and boops.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="accent-[#E07A5F] w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-2">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-accent-coral" />
              <div>
                <p className="text-xs font-medium text-white">Ambient "Hey Pip" Wake-Word</p>
                <p className="text-[10px] text-text-tertiary">
                  Low-power local acoustic trigger expands the notch hands-free.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={wakeWordEnabled}
              onChange={(e) => setWakeWordEnabled(e.target.checked)}
              className="accent-[#E07A5F] w-4 h-4 cursor-pointer"
            />
          </div>
        </div>

        {/* Section 3: Local AI Model Stack */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-3">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-accent-coral" />
            Local Machine Intelligence Stack
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-text-secondary block mb-1">Whisper.cpp Engine</span>
              <select
                value={selectedWhisperModel}
                onChange={(e) => setSelectedWhisperModel(e.target.value)}
                className="w-full bg-notch-inset border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="ggml-tiny.en">ggml-tiny.en (39 MB, Ultra-fast)</option>
                <option value="ggml-base.en">ggml-base.en (142 MB, Recommended)</option>
                <option value="ggml-small.en">ggml-small.en (466 MB, High Accuracy)</option>
              </select>
            </div>

            <div>
              <span className="text-[11px] text-text-secondary block mb-1">Local Ollama LLM</span>
              <select
                value={selectedOllamaModel}
                onChange={(e) => setSelectedOllamaModel(e.target.value)}
                className="w-full bg-notch-inset border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="llama3.2:3b">Llama 3.2 3B (Fast synthesis)</option>
                <option value="qwen2.5:3b">Qwen 2.5 3B (Structured JSON)</option>
                <option value="mistral:7b">Mistral 7B (Deep reasoning)</option>
                <option value="offline-heuristic">Offline Heuristic Engine</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Obsidian Vault Sync */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-accent-coral" />
            Obsidian Vault Local Path
          </label>
          <input
            type="text"
            value={vaultPath}
            onChange={(e) => setVaultPath(e.target.value)}
            className="w-full bg-notch-inset border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
            placeholder="~/Documents/Obsidian/Vault/Meetings"
          />
        </div>

        {/* Section 5: Data Sovereignty & Audit */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white">Reset Local Database</p>
            <p className="text-[10px] text-text-tertiary">Restore default meetings and starter tasks.</p>
          </div>
          <button
            type="button"
            onClick={handleResetData}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-medium border border-red-500/20 active:scale-95"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Data
          </button>
        </div>
      </div>
    </div>
  );
};
