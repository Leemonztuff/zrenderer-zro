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
const ZRendererClient = require('../../../integration/node-client/zrenderer-client');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const ZRENDERER_URL = process.env.ZRENDERER_URL || 'http://localhost:11011';
const ZRENDERER_TOKEN = process.env.ZRENDERER_TOKEN || 'test-token'; // Debería venir de accesstokens.conf

const renderer = new ZRendererClient(ZRENDERER_URL, ZRENDERER_TOKEN);

// Endpoint para obtener la configuración visual de un personaje
app.get('/api/character/:id', async (req, res) => {
    try {
        const { data: character, error } = await supabase
            .from('characters')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Personaje no encontrado' });
            }
            console.warn(`Error en Supabase para ${req.params.id}, usando datos de prueba.`);
            return res.json({
                id: req.params.id,
                name: 'Heroe de Prueba (Fallback)',
                pos: [0, 0, 0],
                visuals: {
                    job: [4012],
                    gender: 1,
                    head: 1,
                    action: 0,
                    bodyPalette: -1,
                    headPalette: -1
                }
            });
        }

        // Mapeamos los datos de Supabase al formato que espera el frontend
        res.json({
            id: character.id,
            name: character.name,
            pos: [character.pos_x, character.pos_y, character.pos_z],
            visuals: {
                job: character.job,
                gender: character.gender,
                head: character.head,
                headgear: character.headgear,
                bodyPalette: character.body_palette,
                headPalette: character.head_palette,
                action: 0
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Endpoint para actualizar la posición del personaje
app.patch('/api/character/:id/position', async (req, res) => {
    try {
        const { x, y, z } = req.body;
        const { data, error } = await supabase
            .from('characters')
            .update({ pos_x: x, pos_y: y, pos_z: z })
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar posición' });
    }
});

// Proxy para el renderizador (opcional, si no quieres exponer el zrenderer directamente)
app.post('/api/render', async (req, res) => {
    try {
        const imageBuffer = await renderer.renderImage(req.body);
        res.set('Content-Type', 'image/png');
        res.send(imageBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al renderizar sprite' });
    }
});

app.listen(port, () => {
    console.log(`Servidor RPG Táctico corriendo en http://localhost:${port}`);
});
