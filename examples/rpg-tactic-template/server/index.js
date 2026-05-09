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

/**
 * Endpoint para obtener la configuración visual de un personaje.
 * En producción, esto consultaría la tabla 'characters' definida en integration/supabase/init.sql
 */
app.get('/api/character/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Si hay credenciales de Supabase válidas, intentamos consultar la DB
        if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY && process.env.SUPABASE_URL !== 'https://your-project.supabase.co') {
            const { data: character, error } = await supabase
                .from('characters')
                .select('*')
                .eq('id', id)
                .single();

            if (!error && character) {
                return res.json({
                    id: character.id,
                    name: character.name,
                    visuals: {
                        job: character.job,
                        gender: character.gender,
                        head: character.head,
                        headgear: character.headgear,
                        weapon: character.weapon,
                        garment: character.garment,
                        shield: character.shield,
                        bodyPalette: character.body_palette,
                        headPalette: character.head_palette,
                        action: 0 // Stand por defecto
                    }
                });
            }
        }

        // Fallback a datos de ejemplo si no hay base de datos configurada o no se encuentra el ID
        res.json({
            id: id,
            name: 'Heroe de Prueba (Local)',
            visuals: {
                job: [4012], // Sniper
                gender: 1,
                head: 1,
                action: 0
            }
        });
    } catch (err) {
        console.error('Error inesperado:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * Proxy para el renderizador.
 * Permite que el frontend pida imágenes sin conocer el token ni la URL del renderizador.
 */
app.post('/api/render', async (req, res) => {
    try {
        if (!req.body || !req.body.job) {
            return res.status(400).json({ error: 'Parámetros de renderizado incompletos' });
        }

        // Normalizamos los parámetros antes de enviarlos al renderizador
        const renderParams = {
            ...req.body,
            // Aseguramos que los tipos sean los esperados por el backend D
            action: parseInt(req.body.action) || 0,
            gender: parseInt(req.body.gender) || 0,
            head: parseInt(req.body.head) || 1
        };

        const imageBuffer = await renderer.renderImage(renderParams);
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=3600'); // Cache de 1 hora
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error en el proxy de renderizado:', error.message);
        res.status(502).json({
            error: 'Error al comunicarse con el renderizador',
            details: error.message
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', rendererUrl: ZRENDERER_URL });
});

app.listen(port, () => {
    console.log(`
    ==================================================
    RPG Táctico (Backend) corriendo en http://localhost:${port}
    - Proxy de renderizado: http://localhost:${port}/api/render
    - Endpoint personajes: http://localhost:${port}/api/character/:id
    ==================================================
    `);
});
