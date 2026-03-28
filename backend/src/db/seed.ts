import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { AppModule } from '../app.module';
import { User } from '../users/schemas/user.schema';
import { Simulation } from '../simulations/schemas/simulation.schema';

interface SeedComponent {
  fileName: string;
  language: string;
  content: string;
}

interface SeedSimulation {
  name: string;
  description: string;
  token: string;
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Insane';
  token_count: number;
  minimum_exp: number;
  status: 'Active' | 'Locked';
  hint: string[];
  score: number;
  metadata: Record<string, unknown>;
  components: SeedComponent[];
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function generateUniqueSlug(
  simulationModel: Model<Simulation>,
  name: string,
  excludeId?: string,
): Promise<string> {
  const baseSlug = toSlug(name) || 'simulation';
  let slug = baseSlug;
  let suffix = 1;

  while (
    await simulationModel.exists({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function simulationComponents(slug: string, html: string): SeedComponent[] {
  return [
    {
      fileName: `${slug}.html`,
      language: 'html',
      content: html,
    },
  ];
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userModel = app.get<Model<User>>(getModelToken(User.name));
    const simulationModel = app.get<Model<Simulation>>(
      getModelToken(Simulation.name),
    );

    const adminEmail = 'admin@gmail.com';
    const participantEmail = 'participant@gmail.com';

    const adminPasswordHash = await bcrypt.hash(adminEmail, 10);
    const participantPasswordHash = await bcrypt.hash(participantEmail, 10);

    const admin = await userModel.findOneAndUpdate(
      { email: adminEmail },
      {
        name: 'Admin',
        email: adminEmail,
        password: adminPasswordHash,
        role: 'ADMIN',
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );

    await userModel.findOneAndUpdate(
      { email: participantEmail },
      {
        name: 'Participant',
        email: participantEmail,
        password: participantPasswordHash,
        role: 'PARTICIPANT',
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );

    const localstorageSlug = 'localstorage';
    const xssSlug = 'xss';
    const hiddenTokensSlug = 'hidden-tokens';

    const simulations: SeedSimulation[] = [
      {
        name: 'LocalStorage',
        description:
          'Find the token stored in browser local storage under the BP-token key.',
        token: 'BP{localstorage_token_found}',
        difficulty: 'Easy',
        token_count: 1,
        minimum_exp: 0,
        status: 'Active',
        hint: [
          'Inspect localStorage from the browser console.',
          'Look for a key named BP-token.',
        ],
        score: 100,
        metadata: {
          category: 'Client Storage',
          objective: 'Read token from local storage key BP-token.',
          tokenStorage: {
            type: 'localStorage',
            key: 'BP-token',
          },
          estimatedMinutes: 5,
        },
        components: simulationComponents(
          localstorageSlug,
          `<!doctype html>
<html>
  <head>
    <title>Neon Desert Fest</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>

  <body class="min-h-screen bg-gradient-to-br from-orange-200 via-orange-300 to-pink-300 text-slate-900">

    <div class="max-w-6xl mx-auto px-6 py-10">

      <section class="backdrop-blur-md bg-white/70 border border-slate-300 rounded-3xl shadow-2xl p-8 md:p-12">

        <span class="inline-block px-4 py-1 text-xs font-semibold rounded-full bg-slate-900 text-slate-200 tracking-wide">
          Neon Desert Fest 2026
        </span>

        <h1 class="mt-4 text-4xl md:text-6xl font-extrabold uppercase tracking-wide">
          Landing In The Dunes
        </h1>

        <p class="mt-4 text-slate-600 text-lg max-w-2xl">
          Three days of synth, skate ramps, and midnight coding under solar towers.
        </p>

        <div class="grid gap-6 mt-10 sm:grid-cols-2 lg:grid-cols-3">

          <div class="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-xl transition">
            <h3 class="text-xl font-bold mb-2">Sunset Stage</h3>
            <p class="text-slate-600">
              Retro-wave bands from 18:00 to 23:00 with projection mapping on sandstone walls.
            </p>
          </div>

          <div class="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-xl transition">
            <h3 class="text-xl font-bold mb-2">Salt Flats Race</h3>
            <p class="text-slate-600">
              Custom bike sprint track with a fuel-cell challenge and prize for best design.
            </p>
          </div>

          <div class="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-xl transition">
            <h3 class="text-xl font-bold mb-2">Cactus Arcade</h3>
            <p class="text-slate-600">
              Pixel cabinets and lo-fi booths. Winner takes the chrome joystick trophy.
            </p>
          </div>

        </div>

        <button
          class="mt-10 px-6 py-3 rounded-xl font-bold text-lg bg-slate-900 text-white hover:bg-slate-800 transition transform hover:scale-105 active:scale-95"
          type="button"
        >
          Reserve Festival Pass
        </button>

      </section>

    </div>

    <script>
        localStorage.setItem('BP-token', 'ATTEMPT_TOKEN');
    </script>

  </body>
</html>`,
        ),
      },
      {
        name: 'XSS',
        description:
          'Abuse reflected XSS in a comment input to expose a token in client-side runtime.',
        token: 'BP{xss_console_disclosure}',
        difficulty: 'Normal',
        token_count: 1,
        minimum_exp: 50,
        status: 'Active',
        hint: [
          'The input is rendered using innerHTML.',
          'Try script injection with console output.',
          'Try to ingext an image with an unknown source and onerror do an alert',
        ],
        score: 200,
        metadata: {
          category: 'Cross-Site Scripting',
          objective:
            'Use script injection to print token in console. Example payload: <script>console.log(token)</script>',
          vulnerableInput: 'comment',
          expectedPayload: '<script>console.log(token)</script>',
          estimatedMinutes: 10,
        },
        components: simulationComponents(
          xssSlug,
          `<!doctype html>
<html>
  <head>
    <title>Urban Threads</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>

  <body class="min-h-screen bg-gray-100 text-gray-900">

    <!-- Navbar -->
    <nav class="bg-white shadow-md">
      <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 class="text-xl font-bold">Urban Threads</h1>
        <div class="space-x-6 text-sm text-gray-600">
          <a href="#">Shop</a>
          <a href="#">Collections</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10 items-center">
      <div>
        <h2 class="text-4xl font-bold leading-tight">
          Minimal Style, Maximum Impact
        </h2>
        <p class="mt-4 text-gray-600">
          Discover our latest streetwear collection designed for comfort and everyday expression.
        </p>
        <button class="mt-6 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition">
          Explore Collection
        </button>
      </div>

      <div class="bg-gray-300 rounded-2xl h-72 flex items-center justify-center text-gray-500">
        Image Preview
      </div>
    </section>

    <!-- Product Section -->
    <section class="max-w-6xl mx-auto px-6 pb-12">
      <h3 class="text-2xl font-semibold mb-6">Featured Items</h3>

      <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div class="bg-white p-4 rounded-xl shadow">
          <div class="h-40 bg-gray-200 rounded-lg mb-3"></div>
          <h4 class="font-semibold">Oversized Hoodie</h4>
          <p class="text-sm text-gray-500">$59</p>
        </div>

        <div class="bg-white p-4 rounded-xl shadow">
          <div class="h-40 bg-gray-200 rounded-lg mb-3"></div>
          <h4 class="font-semibold">Classic Tee</h4>
          <p class="text-sm text-gray-500">$29</p>
        </div>

        <div class="bg-white p-4 rounded-xl shadow">
          <div class="h-40 bg-gray-200 rounded-lg mb-3"></div>
          <h4 class="font-semibold">Cargo Pants</h4>
          <p class="text-sm text-gray-500">$79</p>
        </div>
      </div>
    </section>

    <!-- Comments (looks innocent) -->
    <section class="max-w-3xl mx-auto px-6 pb-16">
      <h3 class="text-xl font-semibold mb-4">Customer Feedback</h3>

      <div class="flex gap-3">
        <input
          id="comment"
          placeholder="Share your thoughts..."
          class="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          onclick="publish()"
          class="px-5 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition"
        >
          Post
        </button>
      </div>

      <div
        id="output"
        class="mt-6 space-y-3 text-sm text-gray-700"
      ></div>
    </section>

    <!-- Footer -->
    <footer class="bg-white border-t py-6 text-center text-sm text-gray-500">
      © 2026 Urban Threads. All rights reserved.
    </footer>

    <!-- KEEP SCRIPT EXACTLY -->
    <script>
      const token = 'BP{xss_console_disclosure}';
      function publish() {
        const value = document.getElementById('comment').value;
        document.getElementById('output').innerHTML = value;
      }
    </script>

  </body>
</html>`,
        ),
      },
      {
        name: 'Hidden Tokens',
        description: 'find the token stored in the code',
        token: 'BP{token}',
        difficulty: 'Easy',
        token_count: 1,
        minimum_exp: 100,
        status: 'Active',
        hint: [
          'look for any hidden elements',
          'look at the form for any hidden inputs',
          'find the token hard coded in the html of the hidden input',
        ],
        score: 200,
        metadata: {
          category: 'Hidden Input',
          objective: 'Inspect HTML and identify token in hidden form input.',
          estimatedMinutes: 6,
        },
        components: simulationComponents(
          hiddenTokensSlug,
          `<!doctype html>
<html>
  <head>
    <title>Create Post</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>

  <body class="min-h-screen bg-gray-100 flex items-center justify-center">

    <div class="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
      <h1 class="text-2xl font-bold mb-4">Create Post</h1>

      <form class="space-y-4">
        <input
          type="text"
          placeholder="Post title"
          class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
        />

        <textarea
          placeholder="Write something..."
          class="w-full px-4 py-2 border rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-black"
        ></textarea>

        <input type="hidden" name="token" value="BP{token}" />

        <button
          type="submit"
          class="w-full py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition"
        >
          Publish
        </button>
      </form>
    </div>

  </body>
</html>`,
        ),
      },
    ];

    await simulationModel
      .deleteMany({
        name: { $in: ['CSRF Bank Transfer', 'IDOR Profile Leak'] },
      })
      .exec();

    for (const simulation of simulations) {
      const existing = await simulationModel
        .findOne({ name: simulation.name })
        .exec();
      const slug = await generateUniqueSlug(
        simulationModel,
        simulation.name,
        existing?._id?.toString(),
      );

      const normalizedComponents = simulation.components.map((component) => ({
        ...component,
        fileName: `${slug}.html`,
      }));

      await simulationModel.findOneAndUpdate(
        { name: simulation.name },
        {
          ...simulation,
          slug,
          components: normalizedComponents,
          createdBy: admin._id,
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
      );
    }

    console.log('Seed completed: users(2), simulations(3)');
  } finally {
    await app.close();
  }
}

void seed();
