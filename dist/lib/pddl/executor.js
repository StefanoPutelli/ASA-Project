import { domain } from "./domain.js";
import { buildProblem } from "./beliefsToProblem.js";
import { onlineSolver, PddlExecutor } from "@unitn-asa/pddl-client";
const pddlExecutor = new PddlExecutor(...domain.actions);
/**
 * Invochi questa funzione nel tuo loop BDI “parallelo”:
 * 1) costruisci il problema PDDL da beliefs
 * 2) chiedi il piano a un solver online
 * 3) esegui il piano passo passo
 */
export async function planAndExec(agent) {
    if (!agent.you) {
        console.warn("planAndExec: agent.you non è ancora definito, skip plan");
        return;
    }
    const problem = buildProblem(agent);
    // in executor.ts, subito prima di chiamare onlineSolver:
    const domainPddl = domain.toPddlString();
    console.log(domainPddl);
    //const problemPddl = problem.toPddlString();
    //console.log(problemPddl);
    const plan = await onlineSolver(domain.toPddlString(), problem.toPddlString());
    await pddlExecutor.exec(plan);
}
