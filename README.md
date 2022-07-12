# ethics-web
## /exps
* GET  / -> Get all experiments.
* GET  /list -> Get a list of all active experiments.
* GET  /status -> Get the current status of all experiments.
* GET  /close/:id/ -> Close a specific experiment's registration period.
* GET  /end/:id/\[:force=true|false\] -> Finish an ongoing experiment and compute the results.
* /apply
  *  GET / -> Get experiments opening for participation.
  *  POST /:id -> Upload registration form responses.
* POST /form -> Retrieve register form using experiment id in request body. 
* POST /start -> Begin an experiment (set id in request body).
* /perform
  *  GET / -> Get a list of all registered experiments (set `email` in query string).
  *  POST / -> Participate in an ongoing experiment (set `subject` and `exp` in query string).
  *  GET /:exp_id/:subject_id -> Obtain experiment material.
  *  POST /:exp_id/:subject_id -> Upload responses.
* /postq/:id
  *  GET / -> Render a post-test questionnaire.
  *  POST / -> Upload responses.
* POST /local/:num -> Participate in an experiment without registering.
## /subjects
* GET /apply -> Render a registration form for new test subjects.
* POST /apply/:num -> Sign up to be a test subject.
## /admin
* GET / -> Retrieve admin options.
* /login
  * GET / -> Render a login form.
  * POST / -> Admin login.
* /init_exp
  * GET / -> Render a wizard to create a new experiment.
  * POST / -> Construct a new experiment.
* /download
  * GET / -> Download results of an experiment (set `exp` in query string).
* GET /logout -> Admin logout.
