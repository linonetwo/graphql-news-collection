/* @flowtype @ts-check */
import 'whatwg-fetch';
import fetch from 'node-fetch';
import './client/networkInterface';

global.fetch = fetch;
