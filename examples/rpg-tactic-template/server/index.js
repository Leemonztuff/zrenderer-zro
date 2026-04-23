const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const ZRendererClient = require('../../../integration/node-client/zrenderer-client');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Configuración de Supabase (ajustar con tus credenciales)
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuración de zrenderer
const zrendererUrl = process.env.ZRENDERER_URL || 'http://localhost:11011';
const zrendererToken = process.env.ZRENDERER_TOKEN || 'your-access-token';
const zClient = new ZRendererClient(zrendererUrl, zrendererToken);

app.use(cors());
app.use(express.json());

/**
 * Endpoint para obtener personajes desde Supabase
 */
app.get('/api/characters', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('characters')
            .select('*');

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Proxy para el renderizador de sprites.
 * Esto evita exponer el token de zrenderer en el frontend.
 */
app.post('/api/render', async (req, res) => {
    try {
        const spriteParams = req.body;
        const imageBuffer = await zClient.renderImage(spriteParams);

        res.set('Content-Type', 'image/png');
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error en proxy de renderizado:', error);
        res.status(500).json({ error: 'Error rendering sprite' });
    }
});

app.listen(port, () => {
    console.log(`Servidor RPG Táctico escuchando en http://localhost:${port}`);
});
