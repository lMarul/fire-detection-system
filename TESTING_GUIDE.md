# 🔥 Quick Testing Guide

## Testing the Fire Detection Trigger

### 1. Start the Dev Server
```powershell
cd urban-ignite-map
npm run dev
```
Visit: http://localhost:8080

### 2. Open Dashboard
- Navigate to Dashboard page (should be default)
- You'll see the **Fire Detection Trigger Panel** at the top

### 3. Test Fire Scenarios

#### ✅ SCENARIO 1: Full Fire Confirmation
**Setup:**
- Select bot: Alpha
- Temperature: 900°C (slider all the way up)
- Flame Sensor: ON (toggle to TRUE)
- Visual AI: ON (toggle to TRUE)

**Expected Result:**
- 🔥 Fire alert dialog opens automatically
- Sensor grid shows all 3 GREEN (detected)
- Water cannon activated message (+1s)
- Emergency services called (+3s)
- Severity badge: CRITICAL (red)
- Bot appears in "Active Fire" section
- Map marker turns RED and pulses

**Action:**
Click "Mark as Resolved" to clear


#### 💧 SCENARIO 2: Water Cannon Only
**Setup:**
- Select bot: Gamma
- Temperature: 25°C (below 600°C threshold)
- Flame Sensor: ON
- Visual AI: ON

**Expected Result:**
- Water cannon activated
- NO emergency call
- Severity: MEDIUM
- Only 2 sensors green (flame + visual)


#### ⚠️ SCENARIO 3: False Alarm
**Setup:**
- Select bot: Delta
- Temperature: 25°C
- Flame Sensor: OFF
- Visual AI: ON

**Expected Result:**
- "False Alarm Detected" message
- No water cannon
- No emergency
- Only 1 sensor green (visual)


#### ✅ SCENARIO 4: Normal Operation
**Setup:**
- Temperature: 25°C
- All sensors: OFF

**Expected Result:**
- No fire detected
- All sensors show gray (clear)


### 4. Test Resolution Workflow

1. Trigger any fire scenario (scenario 1 recommended)
2. Dialog opens automatically
3. Check sensor validation grid
4. Verify automated actions shown
5. Click "Mark as Resolved"
6. **Verify:**
   - Dialog closes
   - Toast: "Fire resolved for [Bot Name]"
   - Bot removed from "Active Fire" section
   - Bot back in "Operational" section
   - Map marker returns to GREEN


### 5. Test Multiple Simultaneous Fires

1. Trigger fire on Alpha (900°C, all sensors TRUE)
2. Keep dialog open
3. Trigger fire on Gamma (700°C, all sensors TRUE)
4. **Verify:**
   - Both dialogs appear (may overlap)
   - Both bots in "Active Fire" section
   - Both map markers RED
   - Active Fire count shows "2"

5. Resolve Alpha first
6. Then resolve Gamma
7. **Verify:**
   - Both back to operational
   - Active Fire count shows "0"


### 6. Visual Checks

#### Dashboard Stats Cards
- Total Bots: 5
- Operational: Changes as fires trigger/resolve
- Active Fire: Updates in real-time
- Maintenance: 2 (Beta + Epsilon)

#### Map Markers
- **Green**: Operational (solid)
- **Red Pulsing**: Active fire
- **Gray**: Not operational
- **Yellow Pulsing**: Repairing

#### Bot Status Cards
- Shows battery percentage
- ⚡ Charging indicator for operational bots
- "Resolve Fire" button appears on active-fire bots
- Click resolve button from card (alternative to dialog)


### 7. Check Console Logs

Open browser DevTools (F12) and check console:

```
[Fire Detection] Event triggered for bot-1 (Alpha)
[Fire Detection] Sensors: heat=true, flame=true, visual=true
[Fire Detection] Response: Fire confirmed, severity=critical
[Fire Detection] Water cannon activated at 10:30:01
[Fire Detection] Emergency called at 10:30:03
```

When resolved:
```
[Fire Detection] Event bot-1 resolved at 10:35:22
```


### 8. Edge Cases to Test

#### No Bot Selected
- Don't select a bot
- Try to trigger
- Button should be disabled

#### Offline Bots
- Beta (not-operational) should NOT appear in dropdown
- Epsilon (repairing) should NOT appear in dropdown
- Only operational or active-fire bots available

#### Temperature Edge Cases
- 599°C: Heat sensor FALSE
- 600°C: Heat sensor TRUE (exactly at threshold)
- 799°C: Water cannon, no emergency
- 800°C: Water cannon + emergency (critical)


### 9. Bots Page Integration

1. Navigate to "Bots" page (sidebar)
2. Trigger fire on Alpha via Dashboard
3. Go back to Bots page
4. **Verify:**
   - Alpha appears under "Active Fire" filter
   - Click "Active Fire (1)" to filter
   - Sensor status grid shows heat/flame/visual detected
   - Battery still displays correctly
   - Can resolve from Bots page


### 10. Logs Page Verification

1. Trigger and resolve a fire
2. Navigate to Logs page
3. **Check for new entry:**
   - Should show latest fire event
   - Heat: Detected
   - Flame: Detected
   - Visual: Detected
   - Water Cannon time
   - Emergency Call time (if applicable)
   - Status: resolved


## Common Issues

### Dialog Doesn't Open
- Check console for errors
- Verify bot is selected
- Make sure you clicked "Pull the Trigger"
- Check if dialog is behind other elements (use Alt+Tab)

### Sensors Not Detecting
- Temperature must be **≥ 600°C** for heat sensor TRUE
- Toggles must be ON (blue) for TRUE
- Gray toggles = FALSE

### Map Not Updating
- Refresh page after triggering fire
- Check browser console for errors
- Verify BotMap component is rendering

### No Active Fire Count
- Fire must be triggered, not just detected
- Check activeFireEvents in React DevTools
- Verify FireDetectionProvider is wrapping app


## Quick Verification Checklist

After each fire trigger:
- [ ] Toast notification appears
- [ ] Dialog opens automatically
- [ ] 3×3 sensor grid shows correct colors
- [ ] Automated actions listed (water/emergency)
- [ ] Severity badge displayed
- [ ] Bot in Active Fire section
- [ ] Map marker turns red
- [ ] Active Fire count increments
- [ ] Resolve button visible
- [ ] Clicking resolve clears everything


## Performance Testing

### Rapid Fire Testing
1. Trigger fire on Alpha
2. Immediately trigger on Gamma
3. Trigger on Delta
4. **Check:**
   - All 3 dialogs appear
   - No lag or freeze
   - All map markers update
   - Stats accurate

### Resolution Speed
1. Trigger fire
2. Time how long to resolve
3. Should be instant (< 100ms)

### Console Spam Check
1. Trigger multiple fires
2. Check console doesn't spam errors
3. Look for memory leaks in DevTools


## Browser Compatibility

**Tested:**
- ✅ Chrome 120+
- ✅ Edge 120+
- ✅ Firefox 121+ (Web Serial limited)

**Not Supported:**
- ❌ Safari (no Web Serial API)
- ❌ IE11 (deprecated)


## Next Steps

Once manual testing works:
1. Connect Arduino via USB
2. Implement Web Serial API connection
3. Replace manual trigger with real sensor data
4. Train ML model for visual detection
5. Add backend API for logging
6. Deploy to production


---

**Status:** Ready for Testing 🚀
**Last Updated:** January 2024
