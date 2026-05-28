const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Inicializar cliente de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Importamos el cliente de zrenderer
// Intentamos cargar desde la ruta relativa de desarrollo o desde la ruta de Docker
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
    if (supabase) {
        const { data: character, error } = await supabase
            .from('characters')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) {
            console.error('Error de Supabase:', error);
            return res.status(404).json({ error: 'Personaje no encontrado en Supabase' });
        }

        // Mapeamos los campos de la DB a lo que espera el frontend
        return res.json({
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
                action: 0 // Acción por defecto
            },
            stats: {
                level: character.level,
                hp: character.hp_current,
                hpMax: character.hp_max,
                sp: character.sp_current,
                spMax: character.sp_max,
                pos: [character.pos_x, 0, character.pos_y]
            }
        });
    }

    // Retornamos un ejemplo estático si Supabase no está configurado
    res.json({
        id: req.params.id,
        name: 'Heroe de Prueba (Estático)',
        visuals: {
            job: [4012],
            gender: 1,
            head: 5,
            action: 0
        },
        stats: {
            level: 1,
            hp: 100,
            hpMax: 100,
            pos: [0, 0, 0]
        }
    });
});

// Proxy para el renderizador
app.post('/api/render', async (req, res) => {
    try {
        if (!req.body.job) {
            return res.status(400).json({ error: 'Falta el parámetro job' });
        }
        const imageBuffer = await renderer.renderImage(req.body);
        res.set('Content-Type', 'image/png');
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error de renderizado:', error);
        res.status(500).json({ error: 'Error al renderizar sprite' });
    }
});

app.listen(port, () => {
    console.log(`Servidor RPG Táctico corriendo en http://localhost:${port}`);
});
