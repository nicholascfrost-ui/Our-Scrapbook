import {NextResponse} from 'next/server';
import {authorize} from '@/lib/server-auth';
import {promises as fs} from 'node:fs';
import path from 'node:path';
export async function GET(req:Request,{params}:{params:Promise<{name:string}>}){const auth=await authorize(req);if('error'in auth)return NextResponse.json({error:auth.error},{status:auth.status});const {name}=await params;if(!/^[\w-]+\.jpg$/.test(name))return new Response('Not found',{status:404});if('local'in auth){try{const b=await fs.readFile(path.join(process.cwd(),'private/photos',name));return new Response(b,{headers:{'Content-Type':'image/jpeg','Cache-Control':'private, max-age=3600'}})}catch{return new Response('Not found',{status:404})}}const {data,error}=await auth.client.storage.from('photos').download(name);if(error)return new Response('Not found',{status:404});return new Response(data,{headers:{'Content-Type':'image/jpeg','Cache-Control':'private, max-age=3600'}})}
