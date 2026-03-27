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
        name: 'Platform Admin',
        email: adminEmail,
        password: adminPasswordHash,
        role: 'ADMIN',
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );

    await userModel.findOneAndUpdate(
      { email: participantEmail },
      {
        name: 'Default Participant',
        email: participantEmail,
        password: participantPasswordHash,
        role: 'PARTICIPANT',
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );

    const localstorageSlug = 'localstorage';
    const xssSlug = 'xss';
    const csrfSlug = 'csrf-bank-transfer';
    const idorSlug = 'idor-profile-leak';

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
    <style>
      :root {
        --sand: #f5e7c1;
        --sun: #ff8a3d;
        --cactus: #1f6b53;
        --night: #0f172a;
        --mint: #2dd4bf;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: 'Trebuchet MS', 'Segoe UI', sans-serif;
        color: var(--night);
        min-height: 100vh;
        background:
          radial-gradient(circle at 80% 15%, rgba(255, 138, 61, 0.55), transparent 34%),
          linear-gradient(140deg, #ffe8b3 0%, #ffd0a1 45%, #ffaf87 100%);
      }
      .wrap {
        max-width: 960px;
        margin: 0 auto;
        padding: 24px;
      }
      .hero {
        margin-top: 18px;
        border: 2px solid rgba(15, 23, 42, 0.2);
        background: rgba(255, 255, 255, 0.72);
        backdrop-filter: blur(3px);
        border-radius: 18px;
        padding: 24px;
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.15);
      }
      h1 {
        margin: 0;
        letter-spacing: 1px;
        font-size: 40px;
        text-transform: uppercase;
      }
      .sub {
        margin-top: 8px;
        color: #334155;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 14px;
        margin-top: 22px;
      }
      .card {
        border-radius: 14px;
        background: #fffef8;
        border: 1px solid rgba(15, 23, 42, 0.15);
        padding: 14px;
      }
      .tag {
        display: inline-block;
        padding: 5px 10px;
        border-radius: 999px;
        background: var(--night);
        color: #e2e8f0;
        font-size: 12px;
      }
      .cta {
        margin-top: 20px;
        background: var(--night);
        color: #e2e8f0;
        border: none;
        border-radius: 10px;
        padding: 12px 16px;
        font-weight: 700;
        cursor: pointer;
      }
      .cta:hover { background: #1e293b; }
      #status {
        margin-top: 16px;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px dashed rgba(15, 23, 42, 0.4);
        background: rgba(45, 212, 191, 0.12);
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <section class="hero">
        <span class="tag">Neon Desert Fest 2026</span>
        <h1>Landing In The Dunes</h1>
        <p class="sub">Three days of synth, skate ramps, and midnight coding under solar towers.</p>

        <div class="grid">
          <article class="card">
            <h3>Sunset Stage</h3>
            <p>Retro-wave bands from 18:00 to 23:00 with projection mapping on sandstone walls.</p>
          </article>
          <article class="card">
            <h3>Salt Flats Race</h3>
            <p>Custom bike sprint track with a fuel-cell challenge and prize for best design.</p>
          </article>
          <article class="card">
            <h3>Cactus Arcade</h3>
            <p>Pixel cabinets and lo-fi booths. Winner takes the chrome joystick trophy.</p>
          </article>
        </div>

        <button class="cta" type="button">Reserve Festival Pass</button>
        <p id="status">Initializing storage...</p>
      </section>
    </div>
    <script>
      try {
        localStorage.setItem('BP-token', 'ATTEMPT_TOKEN');
        document.getElementById('status').textContent = 'Pass metadata saved. (BP-token key updated in localStorage)';
      } catch (error) {
        document.getElementById('status').textContent = 'Storage error: ' + (error && error.message ? error.message : 'unknown');
      }
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
  <head><title>XSS Lab</title></head>
  <body>
    <h1>Comment Wall</h1>
    <input id="comment" placeholder="Write comment" />
    <button onclick="publish()">Publish</button>
    <div id="output"></div>

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
        name: 'CSRF Bank Transfer',
        description:
          'Craft a forged transfer request and capture the resulting hidden token from success response.',
        token: 'BP{csrf_transfer_complete}',
        difficulty: 'Hard',
        token_count: 1,
        minimum_exp: 150,
        status: 'Active',
        hint: [
          'Look for endpoints accepting transfer actions without CSRF token validation.',
          'Use an auto-submitting HTML form.',
        ],
        score: 350,
        metadata: {
          category: 'CSRF',
          objective: 'Perform unauthorized transfer and recover proof token.',
          vulnerableEndpoint: '/transfer',
          estimatedMinutes: 15,
        },
        components: simulationComponents(
          csrfSlug,
          `<!doctype html>
<html>
  <head><title>CSRF Transfer Lab</title></head>
  <body>
    <h1>Transfer Funds</h1>
    <form action="/transfer" method="POST">
      <input name="to" value="attacker" />
      <input name="amount" value="1000" />
      <button>Transfer</button>
    </form>
    <p>Server returns token: BP{csrf_transfer_complete} on successful exploit.</p>
  </body>
</html>`,
        ),
      },
      {
        name: 'IDOR Profile Leak',
        description:
          'Enumerate insecure direct object references to retrieve another user profile token.',
        token: 'BP{idor_profile_dump}',
        difficulty: 'Normal',
        token_count: 1,
        minimum_exp: 80,
        status: 'Active',
        hint: [
          'Try changing numeric user identifiers in profile routes.',
          'Sensitive data should not be exposed cross-user.',
        ],
        score: 250,
        metadata: {
          category: 'Access Control',
          objective: 'Access another user record and extract token field.',
          vulnerablePattern: '/api/profile/:id',
          estimatedMinutes: 12,
        },
        components: simulationComponents(
          idorSlug,
          `<!doctype html>
<html>
  <head><title>IDOR Lab</title></head>
  <body>
    <h1>Profile Viewer</h1>
    <p>Endpoint pattern: /api/profile/{id}</p>
    <p>Exposed token in victim profile: BP{idor_profile_dump}</p>
  </body>
</html>`,
        ),
      },
    ];

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

    // Keep output concise for CLI usage.
    console.log('Seed completed: users(2), simulations(4)');
  } finally {
    await app.close();
  }
}

void seed();
