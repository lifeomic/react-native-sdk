// The order of these imports dictates the order the stories are shown.

// Keep Welcome.stories as the top import
import './Welcome/Welcome.stories';

// For the rest of these, keep them alphabetized by story kind names.

import './ActivityIndicatorView.stories';
import './TrackTile/AdvancedTrackerDetails.stories';
import './TrackTile/AdvancedTrackerEditor.stories';
import './BrandConfigProvider/BrandConfigProvider.stories';
import './CustomAppTileScreen.stories';
import './CustomScreenInjection/CustomScreenInjection.stories';
import './ExampleApp/ExampleApp.stories';
import './TrackTile/Indicator.stories';
import './TrackTile/ManageTrackers.stories';
import './MyData';
import './NoInternetToastProvider.stories';
import './Notifications/NotificationsScreen.stories';
import './OAuth.stories';
import './TrackTile/Pillar.stories';
import './TrackTile/PillarsTile.stories';
import './SettingsScreen/SettingsScreen.stories';
import './SharingRenderers';
import './Wearables/SelectorRow.stories';
import './Wearables/SelectorView.stories';
import './Wearables/SwitchRow.stories';
import './Wearables/SyncTypeSelectionRow.stories';
import './Wearables/SyncTypeSelectionView.stories';
import './TrackTile/Tracker.stories';
import './TrackTile/TrackerDetails.stories';
import './TrackTile/TrackerHistoryChart.stories';
import './TrackTile/TrackTiles.stories';
import './Wearables/WearableRow.stories';
import './Wearables/WearablesView.stories';

// TODO: Over time, we may want to re-group several stories into the same story
// kind, for example `storiesOf('Pillars', ...` could have everything related
// to pillars.
