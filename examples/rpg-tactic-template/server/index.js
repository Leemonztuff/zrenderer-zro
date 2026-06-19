const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Inicializar cliente de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Intentar cargar el cliente de zrenderer
let ZRendererClient;
try {
    // Soporta tanto rutas locales como volúmenes de docker
    ZRendererClient = require('../../../integration/node-client/zrenderer-client');
} catch (e) {
    console.warn("ZRendererClient no encontrado en la ruta de integración, intentando ruta alternativa...");
    try {
        ZRendererClient = require('../integration/node-client/zrenderer-client');
    } catch (e2) {
        console.error("No se pudo cargar ZRendererClient. El proxy de renderizado no funcionará.");
    }
}

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const ZRENDERER_URL = process.env.ZRENDERER_URL || 'http://localhost:11011';
const ZRENDERER_TOKEN = process.env.ZRENDERER_TOKEN || 'test-token';

let renderer;
if (ZRendererClient) {
    renderer = new ZRendererClient(ZRENDERER_URL, ZRENDERER_TOKEN);
}

// Endpoint para obtener la configuración completa de un personaje
app.get('/api/character/:id', async (req, res) => {
    try {
        const { data: character, error } = await supabase
            .from('characters')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !character) {
            console.warn(`Personaje ${req.params.id} no encontrado, usando fallback.`);
            return res.json({
                id: req.params.id,
                name: 'Héroe de Prueba',
                visuals: {
                    job: [4012],
                    gender: 1,
                    head: 1,
                    action: 0
                },
                pos_x: 0,
                pos_z: 0
            });
        }

        res.json({
            id: character.id,
            name: character.name,
            visuals: {
                job: character.job,
                gender: character.gender,
                head: character.head,
                bodyPalette: character.body_palette,
                headPalette: character.head_palette,
                outfit: character.outfit,
                headgear: character.headgear,
                garment: character.garment,
                weapon: character.weapon,
                shield: character.shield
            },
            pos_x: character.pos_x,
            pos_y: character.pos_y,
            pos_z: character.pos_z
        });
    } catch (err) {
        res.status(500).json({ error: 'Error interno al obtener personaje' });
    }
});

// Endpoint para actualizar la posición del personaje
app.patch('/api/character/:id/position', async (req, res) => {
    const { x, y, z } = req.body;
    try {
        const { error } = await supabase
            .from('characters')
            .update({ pos_x: x, pos_y: y, pos_z: z })
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true, position: { x, y, z } });
    } catch (err) {
        console.error("Error al actualizar posición:", err);
        res.status(500).json({ error: 'No se pudo guardar la posición' });
    }
});

// Proxy para el renderizador
app.post('/api/render', async (req, res) => {
    if (!renderer) {
        return res.status(503).json({ error: 'Servicio de renderizado no disponible' });
    }
    try {
        const imageBuffer = await renderer.renderImage(req.body);
        res.set('Content-Type', 'image/png');
        res.send(imageBuffer);
    } catch (error) {
        console.error("Error en proxy de renderizado:", error.message);
        res.status(500).json({ error: 'Error al renderizar sprite' });
    }
});

app.listen(port, () => {
    console.log(`Servidor RPG Táctico corriendo en http://localhost:${port}`);
});
