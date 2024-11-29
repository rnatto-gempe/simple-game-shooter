# Sword Battle Royale - Multiplayer Game

Um jogo multiplayer de batalha onde jogadores duelam usando projéteis em um mapa com obstáculos.

## Pré-requisitos

- Node.js instalado
- Visual Studio Code
- Extensão "Dev Tunnels" do VS Code

## Configuração do Projeto

1. Crie uma pasta para o projeto e adicione dois arquivos:
   - `server.js`: código do servidor
   - `index.html`: código do cliente

2. Inicialize o projeto Node.js:
```bash
npm init -y
```

3. Instale as dependências:
```bash
npm install ws
```

## Configurando o Dev Tunnel

1. Abra o VS Code
2. Clique no ícone "Remote Explorer" na barra lateral
3. Na seção "Dev Tunnels", clique em "Create A Tunnel"
4. Escolha um nome para seu túnel
5. Selecione "Port" e insira 3000
6. Escolha "Public" para visibilidade
7. Clique em "Create"

## Iniciando o Servidor

1. No arquivo `index.html`, localize a linha com o WebSocket e substitua a URL pelo seu túnel:
```javascript
const ws = new WebSocket('wss://seu-tunel.devtunnels.ms');
```

2. Inicie o servidor:
```bash
node server.js
```

3. No VS Code, clique com o botão direito no túnel criado e selecione "Start Tunnel"

## Jogando

1. Compartilhe o link do seu túnel com outros jogadores
2. Cada jogador deve abrir o arquivo `index.html` em seu navegador
3. Controles:
   - WASD ou setas para movimento
   - Clique do mouse para atirar
   - Evite ser atingido por projéteis inimigos

## Recursos do Jogo

- Movimento em 8 direções
- Tiro em 360 graus
- Paredes geradas aleatoriamente
- Sistema de colisão
- Morte instantânea ao ser atingido
- Reinício automático quando sobra apenas um jogador

## Troubleshooting

- Se o jogo não conectar:
  - Verifique se o servidor está rodando
  - Confirme se o túnel está ativo
  - Verifique se a URL do WebSocket está correta
  
- Se houver lag:
  - Tente reiniciar o túnel
  - Verifique sua conexão com a internet
  - Tente usar um túnel em uma região mais próxima

## Notas Importantes

- O túnel do VS Code tem limites de banda e conexões
- Para uso prolongado ou produção, considere um servidor dedicado
- O jogo não salva estado entre sessões
- Todos os jogadores precisam ter uma boa conexão para melhor experiência

## Desenvolvido com

- Node.js
- WebSocket (ws)
- HTML5
- JavaScript
- VS Code Dev Tunnels