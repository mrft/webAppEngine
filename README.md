# webAppEngine
An Elm/appRun inspired engine for web applications

This is an experiment, trying to find a good abstraction for only writing the useful parts of a web application, and trying to improve my understanding of typescript's possibilities.

YYSun's [blog post](https://medium.com/@yiyisun/elm-architecture-in-8-lines-of-typescript-d5a33aca75c1) about AppRun inspired me a lot in how TypeScript could be extremely helpful in building a really lightweight engine for web applications. Especially the idea that the Elm architecture without the new language (which was also a bit off-putting for me) basically consists of a well thoght through engine with a very good separation of concerns.

But while reading about AppRun, I thought there was one fundamental flaw in AppRun, and that is its support for 'async reducers'.
Async reducers can easily cause trouble in my opinion:
* an event causes an async reducer te be called, which gets the current state (stateT1) as a parameter
* the async reducer starts doing something that takes a while
* a synchronous event causes a reducer to be called (also with stateT1) that produces a new state (stateT2)
* the async reducer continues after the async operation, and computes a new state NOT BASED ON THE CURRENT STATE stateT2, but based on the old state stateT1 => stateT2 gets lost along the way!!!

This causes hard to debug problems which is why async operations should be handled separately like in Elm (or like Redux-Loop if you're more familiar with Redux).

I also wanted to take the type checking and auto-completion with typescript one step further (eliminating the need for useless boilerplate that has plagued Redux like action creators for example).

