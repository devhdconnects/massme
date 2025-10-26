import { NextRequest } from "next/server";
import { setCountryAction } from "../country";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  await setCountryAction(form);
  // setCountryAction fait déjà un redirect() ⇒ on ne revient normalement jamais ici
  return new Response(null, { status: 204 });
}
