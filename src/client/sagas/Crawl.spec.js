import { getPage, getContent } from './Crawl';

const url = '';
getPage(url).then((result) => {
  console.log(result);
  return result;
}).then(getContent).then((result) => {
  console.log(result);
  return result;
});
