
# Autonomous Deliveroo Agents – UniTrento ASA

A **TypeScript** project for the course **Autonomous Software Agents** from the University of Trento.  
The codebase explores:

* **BDI architecture** – beliefs, desires, intentions.
* **PDDL planning** – optional fallback to a planner when parcel density is high.
* **Collaborative autonomy** – multiple agents communication system.

It works on Deliveroojs, the simulated environment provided by the course.

---

## Folder layout

```

src/
├─ types/                      # Ambient typings for external libs
│  ├─ deliveroo-js-client.d.ts # Deliveroo client API
│  └─ pddl-client.d.ts         # PDDL planner client API
├─ lib/
│  ├─ bdi/                     # Core BDI modules
│  │  ├─ beliefs.ts            # Percepts → internal state
│  │  ├─ desires.ts            # Goal generation & refresh
│  │  └─ intentions.ts         # Plan execution queue
│  ├─ com/commons.ts           # Inter-agent protocol helpers
│  ├─ gui/gui.ts               # CLI real-time visualisation
│  ├─ pddl/pddl.ts             # PDDL
│  └─ utils/                   # Generic helpers
│     ├─ astar.ts              # A\* path-finding
│     ├─ gain.ts               # Reward vs. distance heuristic
│     ├─ closestDP.ts          # Nearest delivery-point
│     └─ …                     # Misc utilities
├─ MyAgent.ts                  # Concrete agent class
├─ index.ts                    # Run 1 agent – competitive
├─ index_spawn.ts              # Run 1 agent with options
└─ multi_spawn.ts              # Run 2 cooperating agents

````

---

## Quick start
Install all dependencies:
````bash
npm install
````
Then run one of the following commands:
| Command             | Behaviour                                         |
| ------------------- | ------------------------------------------------- |
| `npm start`         | **1 agent** – competitive |
| `npm run startpddl` | **1 agent** – competitive, **PDDL enabled**       |
| `npm run spawn`     | **2 agents** – cooperative/competitive |
| `npm run spawnpddl` | **2 agents** – cooperative, **PDDL enabled**      |

---

## Configuration

Edit `.env` in the project root (optional):

````dotenv
SERVER_URL = "http://localhost:8080/"
SALUTO = "Hi from Trento!"
PAAS_HOST = "http://192.168.178.54:5001"
````

Any value left undefined falls back to the library defaults.

> From each launch script you can enable the optional terminal GUI for real-time visuals. Just remember to activate it for one agent at a time.



