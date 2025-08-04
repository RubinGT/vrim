# Marvel Rivals Randomizer

A sophisticated character randomizer application for Marvel Rivals game featuring animated slot machines, persistent icon storage, and comprehensive history tracking.

## Features

### Character Selection
- **Animated Slot Machine**: 3-second spin animation with realistic slow-down effect
- **Dual Player Support**: Separate sections for Niko (cyan theme) and Safwan (orange theme)
- **Smart Randomization**: Prevents duplicate character selection between players
- **Spin Both**: Simultaneously randomize characters for both players

### Icon Management
- **Custom Character Icons**: Upload and store custom images for each character
- **Persistent Storage**: Icons are permanently saved using localStorage
- **Visual Preview**: Real-time preview of uploaded icons in the slot machine
- **Easy Management**: Upload/remove icons through dedicated Asset Management modal

### History & Progress Tracking
- **Selection History**: Complete log of all character selections with timestamps
- **Available Characters**: Real-time display of remaining unselected characters
- **Purge Functionality**: Reset all history and start fresh
- **Smart Filtering**: Automatically excludes previously selected characters from randomization

### User Experience
- **Responsive Design**: Mobile-first design that works across all device sizes
- **Modern UI**: Dark theme with cyberpunk-inspired visual effects
- **Smooth Animations**: Fluid transitions and visual feedback
- **Keyboard Support**: Modal controls with ESC key support

## Technical Implementation

### Key Components
- **SlotMachine**: Animated character randomizer with configurable themes
- **PlayerSection**: Individual player interface with controls and status
- **Modal System**: Reusable modal components for asset management and history
- **useLocalStorage Hook**: Custom hook for persistent data storage

### Data Persistence
All user data is stored locally in the browser:
- `mr_custom_icons`: Character icon mappings (base64 data URLs)
- `mr_history_N`: Niko's selection history
- `mr_history_S`: Safwan's selection history

### Character Roster
Complete roster of 40 Marvel Rivals characters:
- Adam Warlock, Black Panther, Black Widow, Captain America
- Cloak & Dagger, Doctor Strange, Emma Frost, Groot
- Hawkeye, Hela, Hulk, Human Torch, Invisible Woman
- Iron Fist, Iron Man, Jeff the Land Shark, Loki
- Luna Snow, Magik, Magneto, Mantis, Mister Fantastic
- Moon Knight, Namor, Peni Parker, Phoenix, Psylocke
- The Punisher, The Thing, Rocket Raccoon, Scarlet Witch
- Squirrel Girl, Spider-Man, Star-Lord, Storm, Thor
- Ultron, Venom, Winter Soldier, Wolverine

## Usage

1. **Character Selection**: Click "Spin" for individual players or "Spin Both" for simultaneous selection
2. **Icon Upload**: Use "Asset Management" to upload custom character icons
3. **History Review**: Check "History" to view past selections and remaining characters
4. **Reset Progress**: Use "Purge All" to clear history and start over

## Development

Built with:
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- React hooks for state management

The application uses only localStorage for data persistence, making it completely client-side with no database requirements.

## Deployment

### GitHub Pages
This application is configured for GitHub Pages deployment:

1. **Build for static export**: `npm run build`
2. **Local testing**: `npm start` (serves the exported `out/` directory)
3. **Deploy**: Push the `out/` directory to your GitHub Pages branch

The app uses static export configuration (`output: 'export'`) making it compatible with GitHub Pages hosting.