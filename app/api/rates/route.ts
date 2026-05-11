// app/api/rates/route.ts
import { getRates } from '@/lib/rates';

export async function GET() {
  try {
    const rates = await getRates();
    return Response.json(rates);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return Response.json({ error: 'Не удалось загрузить курсы' }, { status: 500 });
  }
}