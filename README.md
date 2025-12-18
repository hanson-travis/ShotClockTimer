# Pool Shot Clock & Tracker Pro

A professional-grade, web-based shot clock and statistical performance tracker designed for billiards players, league operators, and practice sessions. Optimized for 8-Ball, 9-Ball, and 10-Ball (Rotation).

## 🚀 Key Features

### 🕒 Intelligent Timing
- **Dynamic Shot Clock:** Default 60-second timer with configurable limits.
- **Extension Management:** Track and manage limited "extensions" per rack (e.g., +30s).
- **Audio Alerts:** Human voice announcements at 30s and 10s, with "Time Violation" warnings.
- **Break Bonus:** Automatic time bonus applied to the first shot after a legal break.

### 📊 Advanced Analytics
- **Whisker Plots:** Visualize shot timing distribution (Min, Max, Mean, and Standard Deviation).
- **Performance Matrix:** Track potting accuracy, safety success rates, and time violations across the entire session.
- **Safety Success Tracking:** Automatically evaluates "Safety" shots based on the opponent's subsequent performance.

### 🎱 Flexible Match Formats
- **Single Game:** Infinite play mode where you just track who breaks next.
- **Race To:** Classic tournament format (e.g., Race to 5).
- **Set Play:** Play a fixed number of games (e.g., Best of 9).
- **Three-Foul Rule:** Optional automatic loss detection for 3 consecutive fouls (common in 9-ball).

---

## 🕹️ How to Use

1. **Initialize Session:** Enter player names and set your desired match format (Single, Race, or Set).
2. **Aiming Phase:** The clock starts as soon as a player's inning begins.
3. **Shot Struck:** Click the large **SHOT STRUCK** button the instant the cue ball is hit.
4. **Assessment:** Record the outcome (Potted, Missed, Safety, Foul).
5. **Rack Completion:** Once a rack is won, select the next breaker to start the next rack.
6. **Session Stats:** Open the **Statistics** panel at any time to see detailed timing and accuracy breakdowns.

## ⌨️ Controls
- **Large Action Button:** Logs "Shot Struck" or "Break Struck".
- **Settings Icon:** Modify match format or timing rules mid-session.
- **Undo Button:** Revert the last recorded shot or game outcome.
- **Pause/Resume:** Stop the clock for rack resets or table cleaning.

---

## 🛠️ Technical Details
- **Tech Stack:** React, Tailwind CSS, Lucide Icons, Recharts.
- **Sound Engine:** Web Speech API for announcements and Web Audio API for high-precision beeps.
- **Responsive Design:** Fully optimized for mobile phones (on-table use) and large tablets/monitors.

*Developed with precision for the competitive pool community.*