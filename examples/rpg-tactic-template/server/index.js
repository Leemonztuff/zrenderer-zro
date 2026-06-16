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

// Endpoint para obtener la configuración visual y posición de un personaje
app.get('/api/character/:id', async (req, res) => {
    try {
        const { data: character, error } = await supabase
            .from('characters')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !character) {
            console.warn(`Personaje ${req.params.id} no encontrado en Supabase, usando datos de prueba.`);
            return res.json({
                id: 'default-id',
                name: 'Héroe de Prueba',
                pos_x: 0,
                pos_y: 0,
                visuals: {
                    job: [4012], // Sniper
                    gender: 1,
                    head: 5,
                    action: 0
                }
            });
        }

        // Mapeamos los datos de Supabase al formato que espera el frontend
        res.json({
            id: character.id,
            name: character.name,
            pos_x: character.pos_x || 0,
            pos_y: character.pos_y || 0,
            visuals: {
                job: character.job || [0],
                gender: character.gender ?? 1,
                head: character.head ?? 1,
                outfit: character.outfit ?? 0,
                headgear: character.headgear || [],
                garment: character.garment ?? 0,
                weapon: character.weapon ?? 0,
                shield: character.shield ?? 0,
                body_palette: character.body_palette ?? -1,
                head_palette: character.head_palette ?? -1,
                action: 0 // Acción inicial (Stand)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Endpoint para actualizar la posición del personaje (Persistencia Táctica)
app.patch('/api/character/:id/position', async (req, res) => {
    const { x, y } = req.body;

    try {
        const { error } = await supabase
            .from('characters')
            .update({ pos_x: x, pos_y: y, updated_at: new Date() })
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({ success: true, position: { x, y } });
    } catch (err) {
        console.error("Error al actualizar posición:", err);
        // Si falla (ej: no hay DB), respondemos éxito para permitir juego local/demo
        res.json({ success: false, message: "Modo offline o error de DB", position: { x, y } });
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
