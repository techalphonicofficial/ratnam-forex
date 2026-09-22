const PROJECTS = {
  Travel_Holiday: {
    key: 'Travel_Holiday',
    displayName: 'TRAVELS HOLIDAY',
    legalName: 'ITS TRAVELS AND TOURS',
    logo: '',
    primary: '#FF6000',
    primaryHover: '#E55600',
    primaryLight: '#FFE8D9',
    primaryBorder: '#FF8A40',
    secondary: '#1F2A44',
    secondaryHover: '#161F33',
  },
  Travel_and_Tour: {
    key: 'Travel_and_Tour',
    displayName: 'ITS TRAVELS AND TOURS',
    legalName: 'ITS TRAVELS AND TOURS',
    logo: '/ITS.webp',
    primary: '#f58220',
    primaryHover: '#d96b09',
    primaryLight: '#fff2e5',
    primaryBorder: '#ffc38a',
    secondary: '#026eb5',
    secondaryHover: '#005f9f',
  },
};

export function getProjectKey() {
  const value = process.env.project || process.env.NEXT_PUBLIC_PROJECT || process.env.PROJECT;
  return PROJECTS[value] ? value : 'Travel_Holiday';
}

export function getProjectConfig() {
  return PROJECTS[getProjectKey()];
}
