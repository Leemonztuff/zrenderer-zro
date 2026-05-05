const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

/**
 * CONFIGURACIÓN DE SUPABASE
 * Para conectar con tu base de datos:
 * 1. Crea un proyecto en supabase.com
 * 2. Copia la URL y la Anon Key a tu archivo .env
 * 3. Ejecuta el SQL de integration/supabase/init.sql en el SQL Editor de Supabase
 */
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Importamos el cliente de zrenderer
const ZRendererClient = require('../../../integration/node-client/zrenderer-client');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const ZRENDERER_URL = process.env.ZRENDERER_URL || 'http://localhost:11011';
// El token se genera en 'accesstokens.conf' al iniciar el servicio por primera vez
const ZRENDERER_TOKEN = process.env.ZRENDERER_TOKEN || 'test-token';

const renderer = new ZRendererClient(ZRENDERER_URL, ZRENDERER_TOKEN);

/**
 * ENDPOINT: Obtener datos de un personaje
 * Consulta la tabla 'characters' de Supabase para obtener la configuración visual.
 */
app.get('/api/character/:id', async (req, res) => {
    try {
        const { data: character, error } = await supabase
            .from('characters')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !character) {
            // Fallback para desarrollo si no hay conexión a Supabase
            return res.json({
                id: req.params.id,
                name: 'Héroe de Desarrollo',
                visuals: {
                    job: [4012], // Sniper
                    gender: 1,
                    head: 1,
                    action: 0
                }
            });
        }

        // Mapeamos los datos de la DB al formato que espera el frontend/renderer
        res.json({
            id: character.id,
            name: character.name,
            visuals: {
                job: character.job,
                gender: character.gender,
                head: character.head,
                headgear: character.headgear,
                weapon: character.weapon,
                shield: character.shield,
                bodyPalette: character.body_palette,
                headPalette: character.head_palette
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al consultar el personaje' });
    }
});

/**
 * ENDPOINT: Proxy de Renderizado
 * Actúa como puente para no exponer el ZRENDERER_TOKEN en el frontend.
 */
app.post('/api/render', async (req, res) => {
    try {
        // Obtenemos la imagen directamente como buffer
        const imageBuffer = await renderer.renderImage(req.body);

        res.set({
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=3600' // Cache opcional de 1 hora
        });

        res.send(imageBuffer);
    } catch (error) {
        console.error('Error en el proxy de renderizado:', error.message);
        res.status(500).json({
            error: 'Error al renderizar sprite',
            message: error.message
        });
    }
});

app.listen(port, () => {
    console.log('==============================================');
    console.log(`RPG Tactic Server corriendo en puerto ${port}`);
    console.log(`Proxy configurado hacia: ${ZRENDERER_URL}`);
    console.log('==============================================');
});
