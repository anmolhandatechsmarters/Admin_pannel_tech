// src/locationData.js

export const countries = [
    { id: 'us', name: 'United States' },
    { id: 'ca', name: 'Canada' },
    { id: 'in', name: 'India' }
];

export const states = {
    us: [
        { id: 'ca', name: 'California' },
        { id: 'ny', name: 'New York' },
        { id: 'tx', name: 'Texas' },
        { id: 'fl', name: 'Florida' },
        { id: 'il', name: 'Illinois' },
        { id: 'pa', name: 'Pennsylvania' },
        { id: 'oh', name: 'Ohio' },
        { id: 'mi', name: 'Michigan' },
        { id: 'ga', name: 'Georgia' },
        { id: 'nc', name: 'North Carolina' }
    ],
    ca: [
        { id: 'on', name: 'Ontario' },
        { id: 'bc', name: 'British Columbia' },
        { id: 'qc', name: 'Quebec' },
        { id: 'ab', name: 'Alberta' },
        { id: 'mb', name: 'Manitoba' },
        { id: 'sk', name: 'Saskatchewan' },
        { id: 'nl', name: 'Newfoundland and Labrador' }
    ],
    in: [
        { id: 'dl', name: 'Delhi' },
        { id: 'ma', name: 'Maharashtra' },
        { id: 'tn', name: 'Tamil Nadu' },
        { id: 'ka', name: 'Karnataka' },
        { id: 'up', name: 'Uttar Pradesh' },
        { id: 'wb', name: 'West Bengal' },
        { id: 'pb', name: 'Punjab' },
        { id: 'hr', name: 'Haryana' },
        { id: 'gu', name: 'Gujarat' },
        { id: 'ra', name: 'Rajasthan' }
    ]
};

export const cities = {
    us: {
        ca: [
            { id: 'la', name: 'Los Angeles' },
            { id: 'sf', name: 'San Francisco' },
            { id: 'sd', name: 'San Diego' },
            { id: 'sj', name: 'San Jose' },
            { id: 'oak', name: 'Oakland' },
            { id: 'fres', name: 'Fresno' }
        ],
        ny: [
            { id: 'nyc', name: 'New York City' },
            { id: 'buf', name: 'Buffalo' },
            { id: 'roc', name: 'Rochester' },
            { id: 'sy', name: 'Syracuse' },
            { id: 'alb', name: 'Albany' },
            { id: 'yon', name: 'Yonkers' }
        ],
        tx: [
            { id: 'hou', name: 'Houston' },
            { id: 'dal', name: 'Dallas' },
            { id: 'aus', name: 'Austin' },
            { id: 'sa', name: 'San Antonio' },
            { id: 'el', name: 'El Paso' },
            { id: 'ftw', name: 'Fort Worth' }
        ],
        fl: [
            { id: 'mia', name: 'Miami' },
            { id: 'orlando', name: 'Orlando' },
            { id: 'tpa', name: 'Tampa' },
            { id: 'jax', name: 'Jacksonville' },
            { id: 'hvn', name: 'Hialeah' },
            { id: 'tall', name: 'Tallahassee' }
        ],
        il: [
            { id: 'chi', name: 'Chicago' },
            { id: 'spr', name: 'Springfield' },
            { id: 'peo', name: 'Peoria' },
            { id: 'nap', name: 'Naperville' },
            { id: 'aur', name: 'Aurora' },
            { id: 'cham', name: 'Champaign' }
        ],
        pa: [
            { id: 'phl', name: 'Philadelphia' },
            { id: 'pit', name: 'Pittsburgh' },
            { id: 'all', name: 'Allentown' },
            { id: 'erb', name: 'Erie' },
            { id: 'beth', name: 'Bethlehem' },
            { id: 'read', name: 'Reading' }
        ],
        oh: [
            { id: 'col', name: 'Columbus' },
            { id: 'cle', name: 'Cleveland' },
            { id: 'cin', name: 'Cincinnati' },
            { id: 'ak', name: 'Akron' },
            { id: 'toledo', name: 'Toledo' },
            { id: 'day', name: 'Dayton' }
        ],
        mi: [
            { id: 'det', name: 'Detroit' },
            { id: 'gr', name: 'Grand Rapids' },
            { id: 'wms', name: 'Warren' },
            { id: 'fl', name: 'Flint' },
            { id: 'ann', name: 'Ann Arbor' },
            { id: 'saginaw', name: 'Saginaw' }
        ],
        ga: [
            { id: 'atl', name: 'Atlanta' },
            { id: 'sav', name: 'Savannah' },
            { id: 'col', name: 'Columbus' },
            { id: 'mac', name: 'Macon' },
            { id: 'aug', name: 'Augusta' },
            { id: 'mar', name: 'Marietta' }
        ],
        nc: [
            { id: 'clt', name: 'Charlotte' },
            { id: 'ral', name: 'Raleigh' },
            { id: 'dur', name: 'Durham' },
            { id: 'greens', name: 'Greensboro' },
            { id: 'wilm', name: 'Wilmington' },
            { id: 'con', name: 'Concord' }
        ]
    },
    ca: {
        on: [
            { id: 'tor', name: 'Toronto' },
            { id: 'ott', name: 'Ottawa' },
            { id: 'ham', name: 'Hamilton' },
            { id: 'kaw', name: 'Kawartha Lakes' },
            { id: 'london', name: 'London' },
            { id: 'windsor', name: 'Windsor' }
        ],
        bc: [
            { id: 'van', name: 'Vancouver' },
            { id: 'vic', name: 'Victoria' },
            { id: 'kel', name: 'Kelowna' },
            { id: 'sur', name: 'Surrey' },
            { id: 'lang', name: 'Langley' },
            { id: 'abb', name: 'Abbotsford' }
        ],
        qc: [
            { id: 'mtl', name: 'Montreal' },
            { id: 'que', name: 'Quebec City' },
            { id: 'gat', name: 'Gatineau' },
            { id: 'tro', name: 'Trois-Rivières' },
            { id: 'shaw', name: 'Shawinigan' },
            { id: 'rep', name: 'Repentigny' }
        ],
        ab: [
            { id: 'cal', name: 'Calgary' },
            { id: 'edm', name: 'Edmonton' },
            { id: 'red', name: 'Red Deer' },
            { id: 'leth', name: 'Lethbridge' },
            { id: 'fort', name: 'Fort McMurray' },
            { id: 'stpa', name: 'St. Albert' }
        ],
        mb: [
            { id: 'win', name: 'Winnipeg' },
            { id: 'br', name: 'Brandon' },
            { id: 'selk', name: 'Selkirk' },
            { id: 'thom', name: 'Thompson' },
            { id: 'port', name: 'Portage la Prairie' },
            { id: 'dau', name: 'Dauphin' }
        ],
        sk: [
            { id: 'sas', name: 'Saskatoon' },
            { id: 'reg', name: 'Regina' },
            { id: 'moos', name: 'Moose Jaw' },
            { id: 'prince', name: 'Prince Albert' },
            { id: 'humb', name: 'Humboldt' },
            { id: 'swift', name: 'Swift Current' }
        ],
        nl: [
            { id: 'stjo', name: 'St. John\'s' },
            { id: 'mount', name: 'Mount Pearl' },
            { id: 'gander', name: 'Gander' },
            { id: 'maryst', name: 'Marystown' },
            { id: 'port', name: 'Port aux Basques' },
            { id: 'baie', name: 'Baie-Comeau' }
        ]
    },
    in: {
        dl: [
            { id: 'del', name: 'Delhi' },
            { id: 'nd', name: 'New Delhi' }
        ],
        ma: [
            { id: 'mum', name: 'Mumbai' },
            { id: 'pun', name: 'Pune' },
            { id: 'nag', name: 'Nagpur' },
            { id: 'aur', name: 'Aurangabad' },
            { id: 'nashik', name: 'Nashik' },
            { id: 'sol', name: 'Solapur' }
        ],
        tn: [
            { id: 'che', name: 'Chennai' },
            { id: 'coi', name: 'Coimbatore' },
            { id: 'mad', name: 'Madurai' },
            { id: 'tir', name: 'Tiruchirappalli' },
            { id: 'sal', name: 'Salem' },
            { id: 'vln', name: 'Vellore' }
        ],
        ka: [
            { id: 'ben', name: 'Bengaluru' },
            { id: 'mys', name: 'Mysuru' },
            { id: 'hub', name: 'Hubli' },
            { id: 'udupi', name: 'Udupi' },
            { id: 'kolar', name: 'Kolar' },
            { id: 'bag', name: 'Bagalkot' }
        ],
        up: [
            { id: 'lko', name: 'Lucknow' },
            { id: 'kan', name: 'Kanpur' },
            { id: 'agra', name: 'Agra' },
            { id: 'var', name: 'Varanasi' },
            { id: 'meer', name: 'Meerut' },
            { id: 'aligarh', name: 'Aligarh' }
        ],
        wb: [
            { id: 'kol', name: 'Kolkata' },
            { id: 'sil', name: 'Siliguri' },
            { id: 'asans', name: 'Asansol' },
            { id: 'durg', name: 'Durgapur' },
            { id: 'burd', name: 'Burdwan' },
            { id: 'krish', name: 'Krishnanagar' }
        ],
        pb: [
            { id: 'chi', name: 'Chandigarh' },
            { id: 'amr', name: 'Amritsar' },
            { id: 'jlr', name: 'Jalandhar' },
            { id: 'pat', name: 'Patiala' },
            { id: 'moh', name: 'Mohali' },
            { id: 'phag', name: 'Phagwara' }
        ],
        hr: [
            { id: 'far', name: 'Faridabad' },
            { id: 'gur', name: 'Gurugram' },
            { id: 'amb', name: 'Ambala' },
            { id: 'pan', name: 'Panchkula' },
            { id: 'karnal', name: 'Karnal' },
            { id: 'sirsa', name: 'Sirsa' }
        ],
        gu: [
            { id: 'amd', name: 'Ahmedabad' },
            { id: 'sur', name: 'Surat' },
            { id: 'vad', name: 'Vadodara' },
            { id: 'raj', name: 'Rajkot' },
            { id: 'bhuj', name: 'Bhuj' },
            { id: 'jun', name: 'Juni Kheda' }
        ],
        ra: [
            { id: 'jaipur', name: 'Jaipur' },
            { id: 'udaipur', name: 'Udaipur' },
            { id: 'ajm', name: 'Ajmer' },
            { id: 'bhi', name: 'Bhiwadi' },
            { id: 'sikar', name: 'Sikar' },
            { id: 'kota', name: 'Kota' }
        ]
    }
};
