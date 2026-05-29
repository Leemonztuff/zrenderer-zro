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
// Soporta tanto rutas locales como dentro de contenedores Docker
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
const ZRENDERER_TOKEN = process.env.ZRENDERER_TOKEN || 'test-token'; // Debería venir de accesstokens.conf

const renderer = new ZRendererClient(ZRENDERER_URL, ZRENDERER_TOKEN);

// Endpoint para obtener la configuración visual de un personaje desde Supabase
app.get('/api/character/:id', async (req, res) => {
    try {
        const { data: character, error } = await supabase
            .from('characters')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return res.status(404).json({ error: 'Personaje no encontrado' });
            throw error;
        }

        // Mapear campos de la DB a los parámetros visuales
        res.json({
            id: character.id,
            name: character.name,
            visuals: {
                job: character.job || [0],
                gender: character.gender,
                head: character.head,
                headgear: character.headgear,
                garment: character.garment,
                weapon: character.weapon,
                shield: character.shield,
                bodyPalette: character.body_palette,
                headPalette: character.head_palette,
                action: 0 // Acción inicial por defecto
            },
            stats: {
                level: character.level,
                hp: { current: character.hp_current, max: character.hp_max },
                sp: { current: character.sp_current, max: character.sp_max }
            },
            position: { x: character.pos_x, y: character.pos_y }
        });
    } catch (error) {
        console.error("Error consultando Supabase:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Proxy para el renderizador para no exponer el token en el cliente
app.post('/api/render', async (req, res) => {
    if (!req.body.job) {
        return res.status(400).json({ error: 'El campo "job" es obligatorio' });
    }

    try {
        const imageBuffer = await renderer.renderImage(req.body);
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=3600'); // Cachear por 1 hora
        res.send(imageBuffer);
    } catch (error) {
        console.error("Error en proxy de renderizado:", error);
        res.status(500).json({ error: 'Error al renderizar sprite' });
    }
});

app.listen(port, () => {
    console.log(`Servidor RPG Táctico corriendo en http://localhost:${port}`);
});
