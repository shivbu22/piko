import React from 'react';
import { STARTER_OUTFITS } from '../mascot/outfits';
import { Sparkles, Check } from 'lucide-react';

interface OutfitPickerProps {
  equippedOutfitId: string;
  onSelectOutfit: (outfitId: string) => void;
  onClose: () => void;
}

export const OutfitPicker: React.FC<OutfitPickerProps> = ({
  equippedOutfitId,
  onSelectOutfit,
  onClose,
}) => {
  return (
    <div className="flex flex-col gap-3 text-text-primary">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-coral" />
          <h3 className="text-xs font-bold">Pip's Wardrobe</h3>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-text-secondary hover:text-white px-2 py-0.5 rounded hover:bg-white/5"
        >
          Close
        </button>
      </div>

      <p className="text-[11px] text-text-secondary">
        Personalize Pip with cosmetic outfits. Each outfit features layered sprite accessories.
      </p>

      <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
        {STARTER_OUTFITS.map((outfit) => {
          const isSelected = equippedOutfitId === outfit.id;
          return (
            <div
              key={outfit.id}
              onClick={() => onSelectOutfit(outfit.id)}
              className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-accent-coral/15 border-accent-coral text-white'
                  : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] text-text-secondary hover:text-text-primary'
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0 shadow-sm"
                style={{ backgroundColor: `${outfit.color}30`, borderColor: outfit.color }}
              >
                {outfit.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-text-primary">{outfit.name}</h4>
                  {isSelected && (
                    <span className="flex items-center gap-0.5 text-[9px] uppercase font-bold text-accent-coral">
                      <Check className="w-2.5 h-2.5" /> Equipped
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-text-secondary truncate mt-0.5">{outfit.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
