/**
 * Vercel Serverless Function for SSG Regeneration
 * Triggered by admin dashboard or Supabase webhooks
 */

import { execSync } from 'child_process';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Verify request (basic security)
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.SSG_WEBHOOK_TOKEN || 'default-token';
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    console.log('🚀 SSG regeneration triggered via webhook');
    
    // Trigger Vercel deployment via webhook
    const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK;
    
    if (deployHookUrl) {
      const response = await fetch(deployHookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trigger: 'ssg-regeneration',
          timestamp: new Date().toISOString(),
          source: 'admin-dashboard'
        })
      });
      
      if (response.ok) {
        console.log('✅ Deployment webhook triggered successfully');
        
        return res.status(200).json({
          success: true,
          message: 'SSG regeneration triggered successfully',
          timestamp: new Date().toISOString(),
          deploymentTriggered: true
        });
      } else {
        throw new Error('Deployment webhook failed');
      }
    } else {
      // Fallback: return success but note no deployment hook
      return res.status(200).json({
        success: true,
        message: 'SSG regeneration request received',
        timestamp: new Date().toISOString(),
        deploymentTriggered: false,
        note: 'No deployment hook configured'
      });
    }
    
  } catch (error) {
    console.error('❌ SSG regeneration failed:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to trigger SSG regeneration',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
