// src/types/pddl-api/index.d.ts

declare module "@unitn-asa/pddl-client" {
    /**
     * Un passo di piano PDDL
     */
    export interface PddlPlanStep {
      parallel: boolean;
      action: string;
      args: string[];
    }
  
    /**
     * Beliefset: raccolta di oggetti e fatti, con serializzazione PDDL
     */
    export class Beliefset {
      constructor();
  
      addObject(obj: string): void;
      removeObject(obj: string): void;
  
      /** Lista di oggetti finora dichiarati */
      readonly objects: string[];
  
      /** Dichiara (o rimuove) un fatto; ritorna true se ha cambiato lo stato */
      declare(fact: string, value?: boolean): boolean;
      /** Shortcut per declare(fact, false) */
      undeclare(fact: string): boolean;
  
      /** Array di [fact, valore] correnti */
      readonly entries: Array<[string, boolean]>;
  
      /** Serializza tutti i fatti in una stringa PDDL */
      toPddlString(): string;
  
      /**
       * Verifica un fatto col Closed World Assumption
       * @param positive true = check positivo, false = check negato
       * @param fact stringa del fatto (es. "light_on kitchen_light")
       */
      check(positive: boolean, fact: string): boolean;
    }
  
    /**
     * Rappresenta un'azione PDDL con precondizioni, effetti e un executor JS
     */
    export class PddlAction {
      constructor(
        name: string,
        parameters: string,
        precondition: string,
        effect: string,
        executor: (...args: any[]) => any
      );
  
      name: string;
      parameters: string;
      precondition: string;
      effect: string;
      executor: (...args: any[]) => any;
  
      /** Genera la rappresentazione testuale in PDDL dell'azione */
      toPddlString(): string;
  
      /**
       * Tokenizza una stringa di literali PDDL
       * @param input es. "(not (lighton ?l))"
       */
      static tokenize(input: string): any[][];
  
      /**
       * Sostituisce i parametri nella lista tokenizzata
       * @param tokenized array prodotto da tokenize()
       * @param parametersMap mappa da "?l" a "light1", ecc.
       */
      static ground(tokenized: any[], parametersMap: Record<string, any>): any[];
  
      /** Precondizioni groundate per i valori passati */
      getGroundedTokenizedPrecondition(
        parameterValueMap: Record<string, any>
      ): any;
  
      /** Effetti groundati per i valori passati */
      getGroundedTokenizedEffect(
        parameterValueMap: Record<string, any>
      ): any;
    }
  
    /**
     * Dominio PDDL: predicati e azioni, generazione stringa .pddl, salvataggio file
     */
    export class PddlDomain {
      name: string;
      predicates: string[];
      actions: PddlAction[];
  
      constructor(name: string, ...actions: PddlAction[]);
  
      /** Aggiunge un predicato (es. "light-on ?l") */
      addPredicate(predicate: string): boolean;
  
      /** Aggiunge una o più azioni al dominio */
      addAction(...actions: PddlAction[]): void;
  
      /** Scrive domain.pddl su file e restituisce il path */
      saveToFile(): Promise<string>;
  
      /** Restituisce la definizione PDDL del dominio */
      toPddlString(): string;
    }
  
    /**
     * Problema PDDL: oggetti, stato iniziale, goal; serializzazione e salvataggio
     */
    export class PddlProblem {
      name: string;
      objects: string;
      inits: string;
      goals: string;
  
      constructor(
        name: string,
        objects: string,
        init: string,
        goal: string
      );
  
      /** Scrive problem.pddl su file e restituisce il path */
      saveToFile(): Promise<string>;
  
      /** Restituisce la definizione PDDL del problema */
      toPddlString(): string;
    }
  
    /**
     * Esecutore “black box” per un piano PDDL già calcolato:
     * chiama gli executor delle PddlAction in ordine/parallelamente
     */
    export class PddlExecutor {
      constructor(...actions: PddlAction[]);
  
      /** Mappa actionName → PddlAction */
      actions: Record<string, PddlAction>;
  
      /** Aggiunge nuove PddlAction all’esecutore */
      addAction(...actions: PddlAction[]): void;
  
      /** Recupera una PddlAction per nome */
      getAction(name: string): PddlAction | undefined;
  
      /**
       * Esegue un piano: array di PddlPlanStep
       * @param plan
       */
      exec(plan: PddlPlanStep[]): Promise<void>;
    }
  
    /**
     * Chiamata a un servizio REST di planning online:
     * invia domain+problem e riceve un array di PddlPlanStep
     */
    export function onlineSolver(
      pddlDomain: string,
      pddlProblem: string
    ): Promise<PddlPlanStep[]>;
  }
  