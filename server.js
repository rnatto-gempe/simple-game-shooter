const http = require('http');
const WebSocket = require('ws');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const GAME_CONFIG = {
    WIDTH: 800,
    HEIGHT: 600,
    PLAYER_SIZE: 32
};

class GameState {
    constructor() {
        this.players = new Map();
        this.colors = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff'];
        this.colorIndex = 0;
        this.gameInProgress = false;
    }

    addPlayer(id, ws) {
        const player = {
            id,
            color: this.colors[this.colorIndex % this.colors.length],
            x: Math.random() * (GAME_CONFIG.WIDTH - GAME_CONFIG.PLAYER_SIZE),
            y: Math.random() * (GAME_CONFIG.HEIGHT - GAME_CONFIG.PLAYER_SIZE),
            isAlive: true,
            ws
        };
        this.players.set(id, player);
        this.colorIndex++;
        return player;
    }

    removePlayer(id) {
        this.players.delete(id);
    }

    updatePlayerPosition(id, x, y) {
        const player = this.players.get(id);
        if (player && player.isAlive) {
            player.x = Math.max(0, Math.min(GAME_CONFIG.WIDTH - GAME_CONFIG.PLAYER_SIZE, x));
            player.y = Math.max(0, Math.min(GAME_CONFIG.HEIGHT - GAME_CONFIG.PLAYER_SIZE, y));
            return true;
        }
        return false;
    }

    handleSwordHit(attackerId, targetId) {
        const attacker = this.players.get(attackerId);
        const target = this.players.get(targetId);

        if (!attacker || !target) return null;
        if (!target.isAlive || !attacker.isAlive) return null;

        target.isAlive = false;
        
        // Verifica se há um vencedor
        const alivePlayers = Array.from(this.players.values()).filter(p => p.isAlive);
        if (alivePlayers.length === 1) {
            return {
                targetId: target.id,
                winner: alivePlayers[0].id,
                gameOver: true
            };
        }

        return { targetId: target.id };
    }

    resetGame() {
        this.players.forEach(player => {
            player.isAlive = true;
            player.x = Math.random() * (GAME_CONFIG.WIDTH - GAME_CONFIG.PLAYER_SIZE);
            player.y = Math.random() * (GAME_CONFIG.HEIGHT - GAME_CONFIG.PLAYER_SIZE);
        });
    }

    getPlayersData() {
        return Array.from(this.players.entries()).map(([id, player]) => ({
            id,
            color: player.color,
            x: player.x,
            y: player.y,
            isAlive: player.isAlive
        }));
    }
}

const gameState = new GameState();

function broadcast(message, excludeId = null) {
    const data = JSON.stringify(message);
    gameState.players.forEach((player, id) => {
        if (id !== excludeId && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(data);
        }
    });
}

wss.on('connection', (ws) => {
    const playerId = Date.now().toString();
    const player = gameState.addPlayer(playerId, ws);

    ws.send(JSON.stringify({
        type: 'init',
        id: playerId,
        players: gameState.getPlayersData()
    }));

    broadcast({
        type: 'playerJoined',
        players: gameState.getPlayersData()
    }, playerId);

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        switch (data.type) {
            case 'movement':
                if (gameState.updatePlayerPosition(data.id, data.x, data.y)) {
                    broadcast({ type: 'positions', players: gameState.getPlayersData() });
                }
                break;

            case 'attack':
                const player = gameState.players.get(data.id);
                if (player && player.isAlive) {
                    broadcast({
                        type: 'swordAttack',
                        attackerId: data.id,
                        direction: data.direction,
                        x: player.x,
                        y: player.y
                    });
                }
                break;

            case 'hit':
                const hitResult = gameState.handleSwordHit(data.attackerId, data.targetId);
                if (hitResult) {
                    if (hitResult.gameOver) {
                        broadcast({
                            type: 'gameOver',
                            winner: hitResult.winner,
                            players: gameState.getPlayersData()
                        });
                        setTimeout(() => {
                            gameState.resetGame();
                            broadcast({
                                type: 'gameReset',
                                players: gameState.getPlayersData()
                            });
                        }, 3000);
                    } else {
                        broadcast({
                            type: 'playerKilled',
                            targetId: hitResult.targetId,
                            players: gameState.getPlayersData()
                        });
                    }
                }
                break;
        }
    });

    ws.on('close', () => {
        gameState.removePlayer(playerId);
        broadcast({
            type: 'playerLeft',
            id: playerId,
            players: gameState.getPlayersData()
        });
    });
});

server.listen(3000, () => console.log('Server running on port 3000'));