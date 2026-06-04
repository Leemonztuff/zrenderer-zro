const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Inicializar cliente de Supabase (configurar en .env)
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Importamos el cliente de zrenderer desde la carpeta de integración
// Soporta tanto rutas locales como dentro de Docker
let ZRendererClient;
try {
    ZRendererClient = require('../../../integration/node-client/zrenderer-client');
} catch (e) {
    ZRendererClient = require('../integration/node-client/zrenderer-client');
}

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const ZRENDERER_URL = process.env.ZRENDERER_URL || 'http://localhost:11011';
const ZRENDERER_TOKEN = process.env.ZRENDERER_TOKEN || 'test-token';

const renderer = new ZRendererClient(ZRENDERER_URL, ZRENDERER_TOKEN);

// Endpoint para obtener la configuración visual de un personaje
app.get('/api/character/:id', async (req, res) => {
    try {
        const { data: character, error } = await supabase
            .from('characters')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !character) {
            console.warn(`Personaje ${req.params.id} no encontrado en Supabase o error: ${error?.message}. Usando datos de prueba.`);
            return res.json({
                id: req.params.id,
                name: 'Héroe de Prueba',
                visuals: {
                    job: [4012], // Sniper
                    gender: 0,
                    head: 5,
                    action: 0
                }
            });
        }

        // Mapeamos los datos de Supabase al formato que espera el frontend
        res.json({
            id: character.id,
            name: character.name,
            visuals: {
                job: character.job,
                gender: character.gender,
                head: character.head,
                outfit: character.outfit,
                headgear: character.headgear,
                garment: character.garment,
                weapon: character.weapon,
                shield: character.shield,
                bodyPalette: character.body_palette,
                headPalette: character.head_palette,
                action: 0 // Acción inicial
            }
        });
    } catch (err) {
        console.error("Error al obtener personaje:", err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Proxy para el renderizador
app.post('/api/render', async (req, res) => {
    try {
        if (!req.body.job) {
            return res.status(400).json({ error: 'El campo job es requerido' });
        }

        const imageBuffer = await renderer.renderImage(req.body);
        res.set('Content-Type', 'image/png');
        res.send(imageBuffer);
    } catch (error) {
        console.error("Error en /api/render:", error.message);
        res.status(500).json({ error: 'Error al renderizar sprite' });
    }
});

app.listen(port, () => {
    console.log(`Servidor RPG Táctico corriendo en http://localhost:${port}`);
});
