# Tetris.stream
A tetris inventory manager for dice rolling tabletops

## Running
### Development
```bash
docker-compose build  
docker-compose up
```

http://localhost:3000 should now be setup to auto-reload a React app,
which will communicate with the Rust API hosted at http://localhost:8000

Both React and Rust should auto restart on changes; 
adding new packages requires a re-up (or manual yarn/cargo build)

### Production
```bash
docker-compose -f docker-compose.yml -f docker-compose.production.yml build  
docker-compose -f docker-compose.yml -f docker-compose.production.yml up
```
http://localhost should run the React app in production mode.
