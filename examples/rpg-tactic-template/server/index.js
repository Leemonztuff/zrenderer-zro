const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Inicializar cliente de Supabase (configurar en .env)
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Importamos el cliente de zrenderer
// Nota: En un entorno de desarrollo real, podrías necesitar ajustar esta ruta
// o usar un paquete npm. Aquí usamos la ruta relativa a la carpeta integration.
let ZRendererClient;
try {
    ZRendererClient = require('../../../integration/node-client/zrenderer-client');
} catch (e) {
    console.warn("No se pudo cargar ZRendererClient desde la ruta relativa, asegúrate de que la carpeta integration esté disponible.");
}

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const ZRENDERER_URL = process.env.ZRENDERER_URL || 'http://localhost:11011';
const ZRENDERER_TOKEN = process.env.ZRENDERER_TOKEN || '';

const renderer = ZRendererClient ? new ZRendererClient(ZRENDERER_URL, ZRENDERER_TOKEN) : null;

// Endpoint para obtener la configuración visual de un personaje
app.get('/api/character/:id', async (req, res) => {
    try {
        const { data: character, error } = await supabase
            .from('characters')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !character) {
            if (error && error.code !== 'PGRST116') { // PGRST116 es 'The result contains 0 rows'
                console.error("Error de Supabase:", error);
            }

            // Fallback para desarrollo si no hay DB configurada
            return res.json({
                id: req.params.id,
                name: 'Héroe de Prueba (Local)',
                visuals: {
                    job: [4012], // Sniper
                    gender: 1,
                    head: 1,
                    action: 0
                }
            });
        }

        // Mapeamos los datos de Supabase al formato que espera el frontend y zrenderer
        res.json({
            id: character.id,
            name: character.name,
            visuals: {
                job: character.job || [0],
                gender: character.gender ?? 1,
                head: character.head ?? 1,
                outfit: character.outfit ?? 0,
                headgear: character.headgear || [],
                garment: character.garment ?? 0,
                weapon: character.weapon ?? 0,
                shield: character.shield ?? 0,
                bodyPalette: character.body_palette ?? -1,
                headPalette: character.head_palette ?? -1,
                action: 0
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Proxy para el renderizador
app.post('/api/render', async (req, res) => {
    if (!renderer) {
        return res.status(500).json({ error: 'Renderer no inicializado' });
    }
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
