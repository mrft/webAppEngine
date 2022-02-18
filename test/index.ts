import * as webAppEngine from '../src';
import { TReducerMap, InterfacetoTuples, TAsyncFunction, appFactory } from '../src';
import { assert } from 'chai';

// type TAppEngineEvents = {
//   [eventName in '+' | '-' | 'change_name']: any /* eventParameters */;
// };

// simply add stuff to the 'base' events interface???
type TMyEvents = {
  '+': number,
  '-': number,
  'change_name': string,
  // 5: 'HostCancellationToken',
}

// const x:TMyEvents = { '5': 'HostCancellationToken' }

type TMyModel = {
  value: number,
  name: string,
}

type T = InterfacetoTuples<TMyEvents>;

/**
 * Will be interpreted by typescript as a tuple,
 * whereas [SomeType, SomeOtherType] is consiodered an Array<SomeType | SomeOtherType>
 * 
 * @param data 
 * @returns 
 */
function tuple<T extends any[]> (...data: T){
  return data;
}

const reducers:TReducerMap<TMyModel, TMyEvents> = [
  // the most 'modern' way is called 'const assertion'
  // cfr. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions
  // [
  //   'change_name',
  //   (m:TMyModel, v:number) => [{ ...m, name: v }, []] as const),
  // ],
  // the technique with the tuple function works
  [
    '+',
    (m:TMyModel, v:number) => tuple({ ...m, value: m.value + v }, []),
  ],
  // the technique that explcitly sets the output of the function works as well
  [
    '-',
    (m:TMyModel, v:number):[TMyModel, any[]] => [{ ...m, value: m.value - v }, []],
  ],
  [
    'change_name',
    (m:TMyModel, v:string) => tuple({ ...m, name: v }, []),
  ]
]


const initialState:TMyModel = {
  'name': 'Pino',
  'value': 0,
}

describe('the app engine should work as expected', () => {
  const app = appFactory<TMyModel, TMyEvents, []>(
    initialState,
    reducers,
    (state:TMyModel) => {
      console.log('state', JSON.stringify(state));
      return JSON.stringify(state);
    }
  );
  
  it('should update the state as expected from the set of rec-ducers', () => {
    app.dispatch('+', 2);
    assert.deepEqual(app.getState(), { value: 2, name: 'Pino' });
    app.dispatch('-', 1);
    assert.deepEqual(app.getState(), { value: 1, name: 'Pino' });
    app.dispatch('change_name', 'John');
    assert.deepEqual(app.getState(), { value: 1, name: 'John' });
  });
});
