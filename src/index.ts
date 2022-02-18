/**
 * So this should become a small library that returns an 'app'.
 * 
 * This library is basically an opinionated 'app engine' in which
 * all the app-specific logic is isolated in a few very specific functions:
 * 
 * * there is the 'initial state'
 * * there is a view function which should return 'what to render' based on the current state
 * * there is an array that maps valid messages (for this application) to a function
 *   that produces a new state + optionally the commands that need to be executed
 *   a valid message has a type, and optionally some parameters
 * * there is an HTMLElement where the app will be rendered to
 *   (we could also give it a render function to take the output
 *    of the view functon, and update the DOM)
 * 
 * IN APPRUN IT IS a bit LIKE THIS
 * app.start<TState,TEvent>(rootElement, initialState, renderView, update);
 */

// import { TemplateResult } from "lit-html";

type TViewFunction<Model, View> = (model: Model) => View; //TemplateResult;

type TAsyncFunction = (...args: any) => Promise<any>;

// type TEventHandler = (x:) => void

type TReducer<Model, Event extends [eventName:string, value:any]> = (model: Model, eventParams: Event[1]) => [model: Model, commands: [f: TAsyncFunction]];


// Interface for app developers to extend with their own events + event parameter types
// except: extending an interface in another file doesn't work
/**
 * @deprecated
 */
interface IAppEngineEvents {
  // [eventName:string]: any /* eventParameters */,
}


type TReducerTuple1<Model> = { [K in keyof IAppEngineEvents]: [
  K,
  (m: Model, v: IAppEngineEvents[K]) => [model: Model, commands: TAsyncFunction[]]
] }[keyof IAppEngineEvents];

// utility to turn interface { k1: v1, k2: v2 } into [k1, v1] | [k2, v2]
type InterfacetoTuples<I> = { [K in keyof I]: [K, I[K]] }[keyof I];

// using the 'distributivity of union types' that is inherent to the 'conditional type' operator (?)
type TReducerTuple2<Model, T extends [any, any]> = T extends [string, any] ? [
                        T[0],
                        (m: Model, v: T[1]) => [ model: Model, commands: TAsyncFunction[] ]
                      ]
                      : never;

type TReducerTuple<Model, Events> = { [K in keyof Events]: [
  K,
  (m: Model, v: Events[K]) => [model: Model, commands: TAsyncFunction[]],
] }[keyof Events];




type TReducerMap1<Model> = Array<
  TReducerTuple1<Model>
>


type TReducerMap<Model, T extends { [k:string]: any }> = Array<
  TReducerTuple<Model, T>
>

/**
 * app factory creates an app that contains a function
 * to end events and commands to the app,
 * and functions to subscribe to model updates, and what not.
 * 
 * The arguments are the app-specific parts that are run by the engine
 * 
 * The type parameters for typesafety are
 *  - the Model type/interface for your application
 *    (interface can be extended so that could make more sense to allow adding stuff to)
 *  - all possible Events (+ event params)
 *  - all possible Commands (for asynchronisity)
 * 
 * @param <Model> initialState
 */
function appFactory<Model, Events extends { [k: string]: any }, Commands extends Array<TAsyncFunction>>(
  initialState: Model,
  eventsToStateTransitionerMap: TReducerMap<Model, Events>,
  view: TViewFunction<Model, string>,
): {
  // on: (eventName:Event[0], handler: TEventHandler<Event>) => void, // to register event handlers
  subscribe: (callback:((state:Model) => void)) => (() => void) // to subscribe to state changes ?
  dispatch: (eventName:keyof Events, p:Events[keyof Events]) => void, // to dispatch events
  getState: () => Model,
} {
  type TEventName = keyof Events;

  // let eventHandlers: Array<TEventHandler<IAppEngineEvents>> = [];

  let subscribers:Array<(state:Model) => void> = [];

  let state = initialState;
  return {
    dispatch: function(eventName:TEventName, p:Events[TEventName]) {
      const newStateCommandsTuple = eventsToStateTransitionerMap.reduce<[model: Model, commands: TAsyncFunction[]]>(
        (acc, cur:TReducerTuple<Model, Events>) => {
          const [curEventName, reducer] = cur;
          if (curEventName === eventName) {
            const curState = acc[0];
            const [newState, commands] = reducer(curState, p);
            return [newState, [...acc[1], ...commands]];
          }
          return acc;
        },
        [state, []],
      );
      // now start executing all commands
      // ...

      // store the new state
      state = newStateCommandsTuple[0];

      // rerender? and then do we actually need other subscribers?
      view(state);

      // and then inform all subscribers of the new state
      subscribers.forEach((sub) => sub(state));
    },

    getState: function() {
      return state;
    },

    subscribe: function(callback) {
      subscribers.push(callback);
      const pos = subscribers.length - 1
      return () => subscribers.splice(pos, 1);
    },

    // on: function(eventName:Events[0], handler: (x:Events[1]) => void) {

    // },
  };
}


export {
  IAppEngineEvents,
  TReducerMap,
  InterfacetoTuples,
  TAsyncFunction,
  appFactory,
}
