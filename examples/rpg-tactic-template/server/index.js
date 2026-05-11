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
const ZRendererClient = require(process.env.NODE_ENV === 'production'
    ? './integration/node-client/zrenderer-client'
    : '../../../integration/node-client/zrenderer-client');

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
            if (error.code === 'PGRST116') { // No rows found
                return res.status(404).json({ error: 'Personaje no encontrado' });
            }
            throw error;
        }

        // Mapeamos los datos de la base de datos a un formato que el frontend entienda fácilmente
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
                action: character.action || 0 // Acción por defecto si no está en DB
            },
            stats: {
                level: character.level,
                hp: { current: character.hp_current, max: character.hp_max },
                sp: { current: character.sp_current, max: character.sp_max }
            }
        });
    } catch (err) {
        console.error('Error al obtener personaje:', err.message);
        res.status(500).json({ error: 'Error al conectar con la base de datos' });
    }
});

// Proxy para el renderizador (opcional, si no quieres exponer el zrenderer directamente)
app.post('/api/render', async (req, res) => {
    try {
        // Validación de parámetros mínimos
        if (!req.body || !req.body.job) {
            return res.status(400).json({
                error: 'Parámetros de renderizado insuficientes',
                message: 'El campo "job" es obligatorio.'
            });
        }

        const imageBuffer = await renderer.renderImage(req.body);
        res.set('Content-Type', 'image/png');
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error en el proxy de renderizado:', error.message);
        res.status(502).json({
            error: 'Error de comunicación con el servicio de renderizado',
            details: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Servidor RPG Táctico corriendo en http://localhost:${port}`);
});
