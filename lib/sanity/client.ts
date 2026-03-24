// This file creates the Sanity client used to fetch content in your Next.js app.
// It does NOT run the Studio — it just queries the Sanity API.
import { createClient } from 'next-sanity'

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01', // use a fixed date — never use 'latest'
  useCdn: false, // false = always fresh data, good for dashboard
})