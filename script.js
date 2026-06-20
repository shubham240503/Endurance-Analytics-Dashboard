// Data Storage
let splitData = [];
let pacingChart;

// Initialize Chart.js
const ctx = document.getElementById('pacingChart').getContext('2d');

// Setting fonts to bright white/grey so it pops against the dark track background
Chart.defaults.color = '#e2e8f0'; 
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.weight = '600';

function initChart() {
    pacingChart = new Chart(ctx, {
        type: 'line',
        data: { datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { 
                    position: 'top', 
                    labels: { usePointStyle: true, boxWidth: 8, font: { size: 14 } } 
                },
                tooltip: { 
                    backgroundColor: 'rgba(11, 17, 32, 0.95)', 
                    titleFont: { size: 14 }, 
                    bodyColor: '#ffffff', 
                    padding: 12, 
                    cornerRadius: 8,
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1
                }
            },
            scales: {
                x: { 
                    type: 'linear', 
                    title: { display: true, text: 'Distance Mark (m)', color: '#94a3b8', font: { size: 12, weight: 'bold' } }, 
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }, // Light grid lines over the dark track
                    ticks: { stepSize: 100, color: '#e2e8f0' } 
                },
                y: { 
                    title: { display: true, text: 'Split Time (Seconds)', color: '#94a3b8', font: { size: 12, weight: 'bold' } }, 
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#e2e8f0' }
                }
            },
            elements: { line: { tension: 0.4, borderWidth: 4 }, point: { radius: 6, hoverRadius: 9 } }
        }
    });
}

// Color palette for runners (Neon colors pop best on dark backgrounds)
const colors = ['#10b981', '#facc15', '#3b82f6', '#f43f5e', '#a855f7'];
let colorIndex = 0;
const athleteColors = {};

// Update Dashboard Function
function updateDashboard() {
    const uniqueAthletes = [...new Set(splitData.map(d => d.athlete))];

    // Calculate Leaderboard
    const athleteStats = {};
    splitData.forEach(d => {
        if(!athleteStats[d.athlete]) { athleteStats[d.athlete] = { totalTime: 0, maxDist: 0 }; }
        athleteStats[d.athlete].totalTime += d.time;
        athleteStats[d.athlete].maxDist = Math.max(athleteStats[d.athlete].maxDist, d.distance);
    });

    const leaderboard = Object.keys(athleteStats).map(name => ({
        name,
        totalTime: athleteStats[name].totalTime,
        maxDist: athleteStats[name].maxDist
    })).sort((a, b) => a.totalTime - b.totalTime);

    // Render Leaderboard
    const leaderboardHTML = document.getElementById('leaderboardList');
    if(leaderboard.length === 0) {
        leaderboardHTML.innerHTML = '<div class="text-center text-slate-500 text-sm italic mt-8">Awaiting initial telemetry...</div>';
    } else {
        leaderboardHTML.innerHTML = leaderboard.map((runner, i) => {
            let rankBadge = i === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 
                            i === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/50' : 
                            i === 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' : 
                            'bg-slate-700 text-slate-400';
                            
            // ---> 1. ADD THIS NEW VARIABLE HERE <---
            let rowClass = i === 0 
                ? 'leaderboard-row rounded-lg p-3 flex justify-between items-center shadow-[0_0_15px_rgba(250,204,21,0.2)] border border-yellow-500/50' 
                : 'leaderboard-row rounded-lg p-3 flex justify-between items-center shadow-md';

            // ---> 2. INJECT THE VARIABLE INTO THE DIV CLASS HERE <---
            return `
            <div class="${rowClass}">
                <div class="flex items-center gap-4">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${rankBadge}">
                        ${i+1}
                    </div>
                    <div>
                        <div class="font-bold text-white text-sm">${runner.name}</div>
                        <div class="text-[10px] text-emerald-400 uppercase tracking-widest mt-0.5">Reached ${runner.maxDist}m</div>
                    </div>
                </div>
                <div class="font-mono text-xl font-bold text-white drop-shadow">
                    ${runner.totalTime.toFixed(2)}<span class="text-xs text-slate-500 ml-1">s</span>
                </div>
            </div>`;
        }).join('');
    }

    // Update Chart
    const datasets = uniqueAthletes.map(athlete => {
        if (!athleteColors[athlete]) {
            athleteColors[athlete] = colors[colorIndex % colors.length];
            colorIndex++;
        }
        const athleteSplits = splitData.filter(d => d.athlete === athlete).sort((a, b) => a.distance - b.distance);
        return {
            label: athlete,
            data: athleteSplits.map(s => ({ x: s.distance, y: s.time })),
            borderColor: athleteColors[athlete],
            backgroundColor: athleteColors[athlete],
        };
    });
    
    pacingChart.data.datasets = datasets;
    pacingChart.update();
}

// Event Listeners
document.getElementById('splitForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const athlete = document.getElementById('athleteName').value.trim();
    const distance = parseFloat(document.getElementById('distance').value);
    const time = parseFloat(document.getElementById('splitTime').value);

    splitData.push({ athlete, distance, time });
    
    document.getElementById('distance').value = distance + 100;
    document.getElementById('splitTime').value = '';
    document.getElementById('splitTime').focus();

    updateDashboard();
});

function clearData() {
    if(confirm("Clear all telemetry data?")) {
        splitData = [];
        updateDashboard();
    }
}

// Pre-load data to demonstrate the chart on top of the track image
function loadSampleData() {
    const samples = [
        { athlete: "Shubham", distance: 200, time: 25.0 },
        { athlete: "Anupam", distance: 200, time: 24.8 },
        { athlete: "Ansh", distance: 200, time: 26.5 },
        { athlete: "Om", distance: 200, time: 27.0 },
        
        { athlete: "Shubham", distance: 400, time: 52.0 },
        { athlete: "Anupam", distance: 400, time: 53.5 },
        { athlete: "Ansh", distance: 400, time: 54.0 },
        { athlete: "Om", distance: 400, time: 56.0 },

        { athlete: "Shubham", distance: 600, time: 80.0 },
        { athlete: "Anupam", distance: 600, time: 82.0 },
        { athlete: "Ansh", distance: 600, time: 85.0 },
        { athlete: "Om", distance: 600, time: 88.0 }
    ];
    splitData = [...samples];
    updateDashboard();
}

// Start
initChart();
loadSampleData();