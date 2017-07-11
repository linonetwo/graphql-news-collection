/* @flow @ts-check */
export type Story = { title: string, text: string, url: string, seedId: string }

export type NewLink = {
  title: string,
  type: 'Explore' | 'List',
  url: string
}
