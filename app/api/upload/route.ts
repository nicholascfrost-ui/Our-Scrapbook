import { NextResponse } from "next/server";
import { authorize } from "@/lib/server-auth";
import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (
    origin &&
    new URL(origin).host !== (req.headers.get("host") || new URL(req.url).host)
  )
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const auth = await authorize(req);
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const form = await req.formData();
    const file = form.get("photo");
    if (!(file instanceof File) || file.size > 12_000_000)
      throw Error("Choose an image under 12 MB.");
    const b = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize(1800, 1800, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    const name = crypto.randomUUID() + ".jpg";
    if ("local" in auth) {
      await fs.mkdir(path.join(process.cwd(), "private/photos"), {
        recursive: true,
      });
      await fs.writeFile(path.join(process.cwd(), "private/photos", name), b);
    } else {
      const { error } = await auth.client.storage
        .from("photos")
        .upload(name, b, { contentType: "image/jpeg" });
      if (error) throw error;
    }
    return NextResponse.json({ name });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not upload image." },
      { status: 400 },
    );
  }
}
