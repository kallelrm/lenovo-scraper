# Lenovo Notebooks Scraper API

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

API para scraping de notebooks Lenovo do site WebScraper.

## Pré-requisitos
- Node.js 18+
- npm ou yarn
- (Opcional) Docker 20+

## Endpoints
- `GET /health` - Health check
- `GET /api/notebooks` - Todos os notebooks Lenovo ordenados por preço crescente.
    - Cache: 5 minutos
    - Rate Limit: 100 requests/15min por IP

## Como rodar o programa

### Instalação local
1. `npm install`
2. `npm run dev`

### Ou com Docker (opcional)
1. `docker build -t lenovo-scraper .`
2. `docker run -p 3000:3000 lenovo-scraper`

### Execução
Acesse `http://localhost:3000/api/notebooks`

ou execute `curl http://localhost:3000/api/notebooks`

## Exemplo de resposta
```json
{
    "source": "scraped",
    "timestamp": "2024-01-21T10:30:00Z",
    "data": [
        {
            "id": "product/63",
            "title": "Lenovo V110-15IAP",
            "price": 321.94,
            "description": "Lenovo V110-15IAP, 15.6\" HD, Celeron N3350 1.1GHz, 4GB, 128GB SSD, Windows 10 Home",
            "rating": 4.5,
            "reviewCount": 8,
            "specs": {
                "screenSize": "15.6\" HD",
                "processor": "Celeron N3350 1.1GHz",
                "memory": "4GB",
                "storage": "128GB SSD",
                "os": "Windows 10 Home"
            }
        }
    ]
}
```

## Cache

A API implementa cache de 5 minutos. Você verá:
- `"source": "scraped"` - Dados coletados agora
- `"source": "cache"` - Dados do cache

Isso evita sobrecarregar o site alvo.

## Decisões de arquitetura

- **Sem repositório**: como os dados são voláteis e vem diretamente do scraping, julguei não ser necessário implementar um repositório, pois não havia a necessidade de armazenamento
- **Cache no controller**: o cache foi implementado para aumentar a eficiência das requisições e permitir múltiplas consultas sem sobrecarregar o site onde os dados são coletados, o que melhora a reputação do bot
- **Arquitetura limpa simplificada**: Domain (entidades para lidar com a padronização dos dados) + Infrastructure (onde as requisições e o scraping é realmente feito) + Presentation (camada dedicada a lidar com as rotas, requisições e respostas da API construída com o express)

## Docker

### Produção
Passos básicos para rodar em ambiente de produção:
```bash
docker build -t lenovo-scraper .
docker run -p 3000:3000 lenovo-scraper
```