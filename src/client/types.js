/* @flow @ts-check */
export type Story = { title: string, text: string, url: string }

export type NewLink = {
  title: string,
  type: 'Explore' | 'List',
  url: string
}
