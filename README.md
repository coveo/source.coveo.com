# Open-source @ Coveo


Uses:

Nice web technologies

- flexbox
- es5 (yes we're late on es6)
- [riotjs](https://muut.com/riotjs/)
- [reqwest](https://github.com/ded/reqwest)

## TODO:

- Add support into coveo.analytics.js
- Get a design
  - light canvas animated background
  - Tiles ala http://heliom.ca/
  - Build with <3 replace
  - Orange instead of red
  - No last commit info
  - commit graph
- Queries
  - repos
  - stats
    - GET /repos/:owner/:repo/languages
    - GET /repos/:owner/:repo/stats/punch_card
    - GET /repos/:owner/:repo/stats/participation
    - GET /repos/:owner/:repo/stats/code_frequency
    - GET /repos/:owner/:repo/stats/commit_activity
  - Global stats (need to compute them from previous queries ^^)
    - code frequency
    - languages
    - punch card
    - participation
