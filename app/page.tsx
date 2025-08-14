"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Types
type PlayerId = 'S';

interface Character {
  name: string;
  defaultImage?: string;
  challenges?: string[];
}

type CustomIcons = Record<string, string>; // character name -> base64 data URL

interface HistoryEntry {
  characterName: string;
  timestamp: number;
}

// Constants
const CHARACTER_ROSTER: Character[] = [
  { name: 'Adam Warlock', defaultImage: 'https://static.dotgg.gg/rivals/characters/adam-warlock-portrait.webp', challenges: ["No Soul Gem Healing or Revival. Support without healing or resurrection abilities."] },
  { name: 'Black Panther', defaultImage: 'https://static.dotgg.gg/rivals/characters/black-panther-portrait.webp', challenges: ["No Vibranium Claws or Pounce. Melee combat without enhanced weapons or mobility."] },
  { name: 'Black Widow', defaultImage: 'https://static.dotgg.gg/rivals/characters/black-widow-portrait.webp', challenges: ["No Invisibility or Stealth Takedown. Engage without stealth or surprise attacks."] },
  { name: 'Captain America', defaultImage: 'https://static.dotgg.gg/rivals/characters/captain-america-portrait.webp', challenges: ["No Shield Throw or Shield Ricochet. Adapt by relying solely on melee combat."] },
  { name: 'Cloak & Dagger', defaultImage: 'https://static.dotgg.gg/rivals/characters/cloak-dagger-portrait.webp', challenges: ["No Darkforce Teleportation or Lightforce Blasts. Combat without mobility or ranged attacks."] },
  { name: 'Doctor Strange', defaultImage: 'https://static.dotgg.gg/rivals/characters/doctor-strange-portrait.webp', challenges: ["No Portals or Time Manipulation. Combat without spatial or temporal control."] },
  { name: 'Emma Frost', defaultImage: 'https://static.dotgg.gg/rivals/characters/emma-frost-portrait.webp', challenges: ["No Diamond Form or Telepathic Blast. Fight without enhanced durability or psychic attacks.", "No Diamond Form or Telepathic Shield. Support without enhanced durability or psychic defense."] },
  { name: 'Groot', defaultImage: 'https://static.dotgg.gg/rivals/characters/groot-portrait.webp' },
  { name: 'Hawkeye', defaultImage: 'https://static.dotgg.gg/rivals/characters/hawkeye-portrait.webp', challenges: ["No Explosive Arrows or Grappling Hook. Engage without ranged explosives or mobility tools."] },
  { name: 'Hela', defaultImage: 'https://static.dotgg.gg/rivals/characters/hela-portrait.webp' },
  { name: 'Hulk', defaultImage: 'https://static.dotgg.gg/rivals/characters/bruce-banner-portrait.webp', challenges: ["No Leap or Ground Slam. Engage enemies without mobility or area control."] },
  { name: 'Human Torch', defaultImage: 'https://static.dotgg.gg/rivals/characters/human-torch-portrait.webp' },
  { name: 'Invisible Woman', defaultImage: 'https://static.dotgg.gg/rivals/characters/invisible-woman-portrait.webp', challenges: ["No Force Field or Invisibility. Support without protection or stealth."] },
  { name: 'Iron Fist', defaultImage: 'https://static.dotgg.gg/rivals/characters/iron-fist-portrait.webp', challenges: ["No Chi Strike or Dragon's Defense. Combat without energy-based attacks or parrying."] },
  { name: 'Iron Man', defaultImage: 'https://static.dotgg.gg/rivals/characters/iron-man-portrait.webp', challenges: ["No Repulsor Blasts or Flight. Fight grounded without ranged attacks."] },
  { name: 'Jeff the Land Shark', defaultImage: 'https://static.dotgg.gg/rivals/characters/jeff-the-land-shark-portrait.webp', challenges: ["No Burrowing or Shark Bite. Combat without mobility or enhanced melee attacks."] },
  { name: 'Loki', defaultImage: 'https://static.dotgg.gg/rivals/characters/loki-portrait.webp', challenges: ["No Illusions or Teleportation. Engage without deception or mobility."] },
  { name: 'Luna Snow', defaultImage: 'https://static.dotgg.gg/rivals/characters/luna-snow-portrait.webp', challenges: ["No Ice Wall or Frostbite. Combat without crowd control or elemental attacks."] },
  { name: 'Magik', defaultImage: 'https://static.dotgg.gg/rivals/characters/magik-portrait.webp', challenges: ["No Soulsword or Teleportation. Combat without mystical weapon or mobility."] },
  { name: 'Magneto', defaultImage: 'https://static.dotgg.gg/rivals/characters/magneto-portrait.webp', challenges: ["No Metal Manipulation or Magnetic Shield. Combat without control over metal objects."] },
  { name: 'Mantis', defaultImage: 'https://static.dotgg.gg/rivals/characters/mantis-portrait.webp', challenges: ["No Spore Slumber or Life Orb Healing. Support without crowd control or healing."] },
  { name: 'Mister Fantastic', defaultImage: 'https://static.dotgg.gg/rivals/characters/mister-fantastic-portrait.webp' },
  { name: 'Moon Knight', defaultImage: 'https://static.dotgg.gg/rivals/characters/moon-knight-portrait.webp', challenges: ["No Moon Darts or Leap Attack. Engage without ranged or mobility abilities."] },
  { name: 'Namor', defaultImage: 'https://static.dotgg.gg/rivals/characters/namor-portrait.webp', challenges: ["No Water Manipulation or Hydrokinetic Shield. Combat without aquatic abilities."] },
  { name: 'Peni Parker', defaultImage: 'https://static.dotgg.gg/rivals/characters/peni-parker-portrait.webp', challenges: ["No Mech Suit or Spider-Bots. Combat without robotic assistance."] },
  { name: 'Phoenix', defaultImage: 'https://static.dotgg.gg/rivals/characters/phoenix-portrait.webp', challenges: ["No Resurrection or Fire Manipulation. Support without revival or elemental control."] },
  { name: 'Psylocke', defaultImage: 'https://static.dotgg.gg/rivals/characters/psylocke-portrait.webp', challenges: ["No Psionic Blade or Teleportation. Combat without psychic weapon or mobility."] },
  { name: 'The Punisher', defaultImage: 'https://static.dotgg.gg/rivals/characters/the-punisher-portrait.webp', challenges: ["No Explosives or Guns. Combat without ranged weapons or area damage."] },
  { name: 'The Thing', defaultImage: 'https://static.dotgg.gg/rivals/characters/the-thing-portrait.webp', challenges: ["No Rock Throw or Earthquake Slam. Combat without ranged or area control abilities."] },
  { name: 'Rocket Raccoon', defaultImage: 'https://static.dotgg.gg/rivals/characters/rocket-raccoon-portrait.webp', challenges: ["No Jetpack or Explosive Gadgets. Support without aerial mobility or area damage."] },
  { name: 'Scarlet Witch', defaultImage: 'https://static.dotgg.gg/rivals/characters/scarlet-witch-portrait.webp', challenges: ["No Chaos Magic or Reality Warping. Support without altering reality or elemental attacks."] },
  { name: 'Squirrel Girl', defaultImage: 'https://static.dotgg.gg/rivals/characters/squirrel-girl-portrait.webp', challenges: ["No Squirrel Summon or Acorn Bombs. Support without minions or explosive devices."] },
  { name: 'Spider-Man', defaultImage: 'https://static.dotgg.gg/rivals/characters/spider-man-portrait.webp' },
  { name: 'Star-Lord', defaultImage: 'https://static.dotgg.gg/rivals/characters/star-lord-portrait.webp', challenges: ["No Jet Boots or Element Guns. Support without mobility or elemental attacks."] },
  { name: 'Storm', defaultImage: 'https://static.dotgg.gg/rivals/characters/storm-portrait.webp', challenges: ["No Lightning or Hurricane. Combat without elemental abilities."] },
  { name: 'Thor', defaultImage: 'https://static.dotgg.gg/rivals/characters/thor-portrait.webp', challenges: ["No Mjolnir Throw or Lightning Strike. Engage in close combat without ranged or AoE attacks."] },
  { name: 'Ultron', defaultImage: 'https://static.dotgg.gg/rivals/characters/ultron-portrait.webp', challenges: ["No Nano Ray or Drones. Combat without advanced technology or support."] },
  { name: 'Venom', defaultImage: 'https://static.dotgg.gg/rivals/characters/venom-portrait.webp', challenges: ["No Symbiote Tendrils or Webbing. Melee combat only, without ranged or crowd control abilities."] },
  { name: 'Winter Soldier', defaultImage: 'https://static.dotgg.gg/rivals/characters/winter-soldier-portrait.webp', challenges: ["No Bionic Arm or Kraken Impact. Engage without enhanced strength or mobility."] },
  { name: 'Wolverine', defaultImage: 'https://static.dotgg.gg/rivals/characters/wolverine-portrait.webp', challenges: ["No Healing Factor or Claw Dash. Fight without regeneration or mobility."] },
].sort((a, b) => a.name.localeCompare(b.name));

const PLAYER_CONFIG = {
  S: {
    name: "Randomizer",
    color: "orange",
    textColor: "text-orange-400",
    borderColor: "border-orange-400",
    buttonClasses: "bg-orange-500/20 border-orange-500 hover:bg-orange-500/40 hover:text-orange-300",
    glow: "text-glow-orange",
    slotShadow: "slot-shadow-orange",
  }
};

// Utility Functions
const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') return initialValue;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: React.SetStateAction<T>) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

const processImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Components
const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary';
}> = ({ children, onClick, disabled = false, className = '', variant = 'primary' }) => {
  const baseClasses = 'px-4 py-2 text-sm md:text-base font-bold uppercase tracking-wider border-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: '',
    secondary: 'bg-gray-700/50 border-gray-600 hover:bg-gray-700/80 hover:text-white',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}> = ({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-11/12 max-w-4xl max-h-[90vh] bg-gray-800/80 border-2 border-gray-600 rounded-lg shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b-2 border-gray-700">
          <h2 className="text-xl font-bold tracking-widest uppercase text-gray-300">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className="overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const SlotReel: React.FC<{
  character: Character | null;
  customIcons: CustomIcons;
  isCenter: boolean;
}> = ({ character, customIcons, isCenter }) => {
  const iconSize = 'w-12 h-12 md:w-14 md:h-14';

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [character]);

  const renderCharacterIcon = (char: Character) => {
    if (char.defaultImage && !imageError) {
      console.log(`Attempting to load default image for ${char.name}: ${char.defaultImage}`);
      return <img src={char.defaultImage} alt={char.name} className={`${iconSize} object-cover rounded-md`} onError={(e) => { console.error(`Failed to load default image for ${char.name}:`, e); setImageError(true); }} />;
    }
    const iconData = customIcons[char.name];
    if (iconData) {
      console.log(`Attempting to load custom icon for ${char.name}: ${iconData.substring(0, 50)}...`);
      return <img src={iconData} alt={char.name} className={`${iconSize} object-cover rounded-md`} onError={(e) => { console.error(`Failed to load custom icon for ${char.name}:`, e); setImageError(true); }} />;
    }
    const initials = char.name.match(/\b\w/g)?.join('').substring(0, 2).toUpperCase() || '';
    return (
      <div className={`${iconSize} bg-gray-700 flex items-center justify-center rounded-md text-lg font-bold`}>
        {initials}
      </div>
    );
  };

  return (
    <div className="h-20 flex items-center justify-center">
       {character ? renderCharacterIcon(character) : (
         isCenter && <span className="text-3xl font-bold text-gray-500">?</span>
       )}
    </div>
  );
};

const SlotMachine: React.FC<{
  isSpinning: boolean;
  targetCharacter: Character | null;
  availableCharacters: Character[];
  customIcons: CustomIcons;
  onSpinEnd: () => void;
  theme: 'orange';
}> = ({ isSpinning, targetCharacter, availableCharacters, customIcons, onSpinEnd, theme }) => {
  const [reel, setReel] = useState<Character[]>([]);
  const [translationY, setTranslationY] = useState(0);
  const config = PLAYER_CONFIG['S'];
  const fallbackCharacter: Character = { name: '?' };
  const REEL_ITEM_HEIGHT = 80; // h-20

  const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  useEffect(() => {
    if (isSpinning && targetCharacter) {
      const shuffled = [...availableCharacters].sort(() => 0.5 - Math.random());
      const targetIndex = Math.floor(Math.random() * (shuffled.length - 1));
      const reelWithTarget = [...shuffled.slice(0, targetIndex), targetCharacter, ...shuffled.slice(targetIndex)];
      const extendedReel = [...reelWithTarget, ...reelWithTarget, ...reelWithTarget];
      setReel(extendedReel);

      const finalPosition = extendedReel.indexOf(targetCharacter, reelWithTarget.length) * REEL_ITEM_HEIGHT;

      let startTime: number | null = null;
      const SPIN_DURATION_MS = 3000;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsedTime = timestamp - startTime;
        const progress = elapsedTime / SPIN_DURATION_MS;
        const easedProgress = easeInOutCubic(progress);

        const currentPosition = easedProgress * finalPosition;
        setTranslationY(currentPosition);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setTranslationY(finalPosition);
          onSpinEnd();
        }
      };

      requestAnimationFrame(animate);
    } else if (targetCharacter) {
        setReel([targetCharacter]);
        setTranslationY(0);
    }
  }, [isSpinning, targetCharacter, availableCharacters, onSpinEnd]);

  return (
    <div className={`h-20 overflow-hidden rounded-lg border-2 bg-black/30 ${config.borderColor}`}>
        <div style={{ transform: `translateY(-${translationY}px)`, transition: 'transform 100ms ease-out' }}>
            {reel.map((character, i) => (
                <SlotReel key={i} character={character} customIcons={customIcons} isCenter={true} />
            ))}
        </div>
    </div>
  );
};

const PlayerSection: React.FC<{
  playerId: PlayerId;
  theme: 'orange';
  availableCharacters: Character[];
  currentSelection: Character | null;
  customIcons: CustomIcons;
  isSpinning: boolean;
  targetCharacter: Character | null;
  onSpin: () => void;
  onSpinEnd: () => void;
  onSkip: () => void;
}> = ({
  playerId,
  theme,
  availableCharacters,
  currentSelection,
  onSpin,
  onSkip,
  customIcons,
  isSpinning,
  targetCharacter,
  onSpinEnd,
}) => {
  const config = PLAYER_CONFIG[playerId];
  const displayedCharacter = isSpinning ? targetCharacter : currentSelection;

  return (
    <section className={`p-4 md:p-6 rounded-lg border-2 bg-gray-800/50 ${config.borderColor}`}>
      <h2 className={`text-2xl font-bold tracking-widest uppercase mb-4 ${config.textColor}`}
          style={{
            textShadow: '0 0 8px rgba(251, 146, 60, 0.8)'
          }}>
        {config.name}
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SlotMachine 
            isSpinning={isSpinning}
            targetCharacter={displayedCharacter}
            availableCharacters={availableCharacters}
            customIcons={customIcons}
            onSpinEnd={onSpinEnd}
            theme={theme}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button 
              onClick={onSpin} 
              disabled={isSpinning || availableCharacters.length === 0}
              className={config.buttonClasses}
            >
              {isSpinning ? 'Spinning...' : (availableCharacters.length === 0 ? 'Roster Exhausted' : 'Spin')}
            </Button>
            <Button 
              onClick={() => onSkip()}
              disabled={isSpinning || !currentSelection}
              className={config.buttonClasses}
            >
             Skip
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-1">Asset Status</h3>
            <div className={`p-3 rounded-md bg-black/30 min-h-[50px] flex items-center border ${config.borderColor}/50`}>
              <p className={`font-semibold text-lg ${config.textColor}`}>
                {currentSelection?.name || 'Awaiting Assignment'}
              </p>
            </div>
          </div>
          {currentSelection?.challenges && currentSelection.challenges.length > 0 && (
            <div>
              <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-1">Challenges</h3>
              <div className={`p-3 rounded-md bg-black/30 min-h-[50px] border ${config.borderColor}/50`}>
                <ul className="list-disc list-inside text-sm text-gray-300">
                  {currentSelection.challenges.map((challenge, index) => (
                    <li key={index}>{challenge}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// Main App Component
export default function Home() {
  const [customIcons, setCustomIcons] = useLocalStorage<CustomIcons>('mr_custom_icons', {});
  const [historyS, setHistoryS] = useLocalStorage<HistoryEntry[]>('mr_history_S', []);

  const [playerSSelection, setPlayerSSelection] = useState<Character | null>(null);
  
  const [isSpinningS, setIsSpinningS] = useState(false);
  
  const [targetCharacterS, setTargetCharacterS] = useState<Character | null>(null);

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const availableCharacters = useMemo(() => {
    const combinedHistoryNames = new Set([...historyS].map(h => h.characterName));
    return CHARACTER_ROSTER.filter(char => !combinedHistoryNames.has(char.name));
  }, [historyS]);

  const handleSpinEnd = useCallback(() => {
    const targetCharacter = targetCharacterS;
    if (!targetCharacter) return;

    const setHistory = setHistoryS;
    const setSelection = setPlayerSSelection;
    const setIsSpinning = setIsSpinningS;

    const newEntry: HistoryEntry = { characterName: targetCharacter.name, timestamp: Date.now() };
    
    setSelection(targetCharacter);
    setHistory(prev => [newEntry, ...prev]);
    setIsSpinning(false);
  }, [targetCharacterS, setHistoryS]);

  const handleSpin = useCallback(() => {
    const isSpinning = isSpinningS;
    if (isSpinning) return;

    const possibleChars = availableCharacters;
    if (possibleChars.length === 0) return;

    const randomIndex = Math.floor(Math.random() * possibleChars.length);
    const selected = possibleChars[randomIndex];
    
    setTargetCharacterS(selected);
    setIsSpinningS(true);
  }, [isSpinningS, availableCharacters]);
  
  const handleSkip = useCallback(() => {
    const setSelection = setPlayerSSelection;
    const setTarget = setTargetCharacterS;
    const setIsSpinning = setIsSpinningS;

    setSelection(null);
    setTarget(null);
    setIsSpinning(false);
  }, []);

  const handleIconUpload = async (characterName: string, file: File) => {
    try {
      const dataUrl = await processImage(file);
      setCustomIcons(prev => ({ ...prev, [characterName]: dataUrl }));
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Could not process image.');
    }
  };

  const handleIconRemove = (characterName: string) => {
    setCustomIcons(prev => {
      const newIcons = { ...prev };
      delete newIcons[characterName];
      return newIcons;
    });
  };

  const purgeAllHistory = useCallback(() => {
    setHistoryS([]);
    setPlayerSSelection(null);
    setTargetCharacterS(null);
    setIsSpinningS(false);
  }, [setHistoryS]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-mono"
         style={{
           backgroundImage: `
             linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
             linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
           `,
           backgroundSize: '2rem 2rem'
         }}>
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-widest text-white uppercase">
            <span className="text-orange-400" style={{textShadow: '0 0 8px rgba(251, 146, 60, 0.8)'}}>Marvel Rivals Randomizer</span>
          </h1>
        </header>

        <main className="space-y-12">
          <PlayerSection
            playerId="S"
            theme="orange"
            isSpinning={isSpinningS}
            targetCharacter={targetCharacterS}
            currentSelection={playerSSelection}
            onSpin={() => handleSpin()}
            onSpinEnd={() => handleSpinEnd()}
            onSkip={() => handleSkip()}
            availableCharacters={availableCharacters}
            customIcons={customIcons}
          />
        </main>

        <footer className="mt-8 md:mt-12 pt-6 border-t-2 border-gray-700">
          <h3 className="text-center text-lg uppercase tracking-widest text-gray-400 mb-4">Master Command Center</h3>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            <Button onClick={() => setIsAssetModalOpen(true)} variant="secondary">
              Asset Management
            </Button>
            <Button onClick={() => setIsHistoryModalOpen(true)} variant="secondary">
              History
            </Button>
          </div>
        </footer>
      </div>

      {/* Asset Management Modal */}
      <Modal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} title="Asset Management">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-300">Upload Character Icons</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CHARACTER_ROSTER.map(character => (
                <div key={character.name} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 flex-shrink-0">
                      {(() => {
                        const [localImageError, setLocalImageError] = React.useState(false);
                        React.useEffect(() => {
                          setLocalImageError(false);
                        }, [character.name]);

                        if (character.defaultImage && !localImageError) {
                          return (
                            <img 
                              src={character.defaultImage} 
                              alt={character.name} 
                              className="w-full h-full object-cover rounded"
                              onError={() => setLocalImageError(true)}
                            />
                          );
                        } else if (customIcons[character.name]) {
                          return (
                            <img 
                              src={customIcons[character.name]} 
                              alt={character.name} 
                              className="w-full h-full object-cover rounded"
                              onError={() => setLocalImageError(true)}
                            />
                          );
                        } else {
                          const initials = character.name.match(/\b\w/g)?.join('').substring(0, 2).toUpperCase() || '';
                          return (
                            <div className="w-full h-full bg-gray-600 flex items-center justify-center rounded text-xs font-bold">
                              {initials}
                            </div>
                          );
                        }
                      })()}
                    </div>
                    <span className="text-sm font-medium text-gray-300 flex-1">{character.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleIconUpload(character.name, file);
                        }}
                      />
                      <span className="block w-full px-3 py-1 text-xs bg-blue-600/50 border border-blue-500 rounded text-center cursor-pointer hover:bg-blue-600/70">
                        Upload
                      </span>
                    </label>
                    {customIcons[character.name] && (
                      <button
                        onClick={() => handleIconRemove(character.name)}
                        className="px-3 py-1 text-xs bg-red-600/50 border border-red-500 rounded hover:bg-red-600/70"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title="Selection History">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-300">Character History</h3>
            <Button onClick={purgeAllHistory} variant="secondary" className="bg-red-600/30 border-red-500 hover:bg-red-600/50">
              Purge All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-orange-400 font-semibold mb-3">History</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {historyS.map(entry => (
                  <div key={entry.timestamp} className="p-2 bg-orange-500/10 border border-orange-500/30 rounded text-sm">
                    <span className="font-medium">{entry.characterName}</span>
                    <span className="text-gray-400 text-xs ml-2">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
                {historyS.length === 0 && (
                  <p className="text-gray-500 text-sm">No selections yet</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-700/30 rounded border border-gray-600">
            <h5 className="font-semibold text-gray-300 mb-2">Remaining Characters</h5>
            <p className="text-sm text-gray-400">
              {availableCharacters.length} characters available: {availableCharacters.map(c => c.name).join(', ')}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}