import {
	BufferGeometry,
	FileLoader,
	Float32BufferAttribute,
	Loader
} from './three.module.js';

class CIFLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( text ) );	// Return of 'parse()' is 'const build' defined
												// in the funciton 'buildGeometry()'

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	load2( text, onLoad, onProgress, onError ) {

		const scope = this;

		// const loader = new FileLoader( scope.manager );
		// loader.setPath( scope.path );
		// loader.setRequestHeader( scope.requestHeader );
		// loader.setWithCredentials( scope.withCredentials );
		// loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( text ) );	// Return of 'parse()' is 'const build' defined
												// in the funciton 'buildGeometry()'

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				// scope.manager.itemError( url );

			}

		// }, onProgress, onError );

	}

	// Based on CanvasMol PDB parser
	// 'parse()' returns a funciton 'buildGeometry()',
	// and 'buildGeometry()' returns 'const build' defined in 'buildGeometry()'. 

	parse( text ) {

		function trim( text ) {

			return text.replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' );

		}

		function capitalize( text ) {

			return text.charAt( 0 ).toUpperCase() + text.substr( 1 ).toLowerCase();

		}

		function hash( s, e ) {

			return 's' + Math.min( s, e ) + 'e' + Math.max( s, e );

		}

		function parseBond( start, length, satom, i ) {

			const eatom = parseInt( lines[ i ].substr( start, length ) );

			if ( eatom ) {

				const h = hash( satom, eatom );

				if ( _bhash[ h ] === undefined ) {

					_bonds.push( [ satom - 1, eatom - 1, 1 ] );
					_bhash[ h ] = _bonds.length - 1;

				} else {

					// doesn't really work as almost all PDBs
					// have just normal bonds appearing multiple
					// times instead of being double/triple bonds
					// bonds[bhash[h]][2] += 1;

				}

			}

		}

		function buildGeometry() {

			const build = {
				geometryAtoms: new BufferGeometry(),
				geometryBonds: new BufferGeometry(),
				geometryLattice: new BufferGeometry(),
				json: {
					atoms: atoms
				}
			};

			const geometryAtoms = build.geometryAtoms;
			const geometryBonds = build.geometryBonds;
			const geometryLattice = build.geometryLattice;

			const verticesAtoms = [];
			const colorsAtoms = [];
			const verticesBonds = [];
			const verticesLattice = [];

			// atoms

			for ( let i = 0, l = atoms.length; i < l; i ++ ) {

				const atom = atoms[ i ];

				const x = atom[ 0 ];
				const y = atom[ 1 ];
				const z = atom[ 2 ];

				verticesAtoms.push( x, y, z );

				const r = atom[ 3 ][ 0 ] / 255;
				const g = atom[ 3 ][ 1 ] / 255;
				const b = atom[ 3 ][ 2 ] / 255;

				colorsAtoms.push( r, g, b );

			}

			// bonds

			for ( let i = 0, l = _bonds.length; i < l; i ++ ) {

				const bond = _bonds[ i ];

				const start = bond[ 0 ];
				const end = bond[ 1 ];

				const startAtom = _atomMap[ start ];
				const endAtom = _atomMap[ end ];

				let x = startAtom[ 0 ];
				let y = startAtom[ 1 ];
				let z = startAtom[ 2 ];

				verticesBonds.push( x, y, z );

				x = endAtom[ 0 ];
				y = endAtom[ 1 ];
				z = endAtom[ 2 ];

				verticesBonds.push( x, y, z );

			}

			// lattice

			if ( lattice.length === 3 ) {

				const al0 = lattice[0];
				const al1 = lattice[1];
				const al2 = lattice[2];

				verticesLattice.push( 0.0, 0.0, 0.0 );
				verticesLattice.push( al0[0], al0[1], al0[2] );

				verticesLattice.push( al0[0], al0[1], al0[2] );
				verticesLattice.push( al0[0]+al2[0], al0[1]+al2[1], al0[2]+al2[2] );

				verticesLattice.push( al0[0]+al2[0], al0[1]+al2[1], al0[2]+al2[2] );
				verticesLattice.push( al2[0], al2[1], al2[2] );

				verticesLattice.push( al2[0], al2[1], al2[2] );
				verticesLattice.push( 0.0, 0.0, 0.0 );


				verticesLattice.push( 0.0, 0.0, 0.0 );
				verticesLattice.push( al1[0], al1[1], al1[2] );

				verticesLattice.push( al1[0], al1[1], al1[2] );
				verticesLattice.push( al1[0]+al2[0], al1[1]+al2[1], al1[2]+al2[2] );

				verticesLattice.push( al1[0]+al2[0], al1[1]+al2[1], al1[2]+al2[2] );
				verticesLattice.push( al2[0], al2[1], al2[2] );


				verticesLattice.push( al0[0], al0[1], al0[2] );
				verticesLattice.push( al0[0]+al1[0], al0[1]+al1[1], al0[2]+al1[2] );

				verticesLattice.push( al0[0]+al1[0], al0[1]+al1[1], al0[2]+al1[2] );
				verticesLattice.push( al0[0]+al1[0]+al2[0], al0[1]+al1[1]+al2[1], al0[2]+al1[2]+al2[2] );

				verticesLattice.push( al0[0]+al1[0]+al2[0], al0[1]+al1[1]+al2[1], al0[2]+al1[2]+al2[2] );
				verticesLattice.push( al0[0]+al2[0], al0[1]+al2[1], al0[2]+al2[2] );


				verticesLattice.push( al0[0]+al1[0]+al2[0], al0[1]+al1[1]+al2[1], al0[2]+al1[2]+al2[2] );
				verticesLattice.push( al1[0]+al2[0], al1[1]+al2[1], al1[2]+al2[2] );

				verticesLattice.push( al1[0], al1[1], al1[2] );
				verticesLattice.push( al1[0]+al0[0], al1[1]+al0[1], al1[2]+al0[2] );

			}

			// build geometry

			geometryAtoms.setAttribute( 'position', new Float32BufferAttribute( verticesAtoms, 3 ) );
			geometryAtoms.setAttribute( 'color', new Float32BufferAttribute( colorsAtoms, 3 ) );

			geometryBonds.setAttribute( 'position', new Float32BufferAttribute( verticesBonds, 3 ) );

			geometryLattice.setAttribute( 'position', new Float32BufferAttribute( verticesLattice, 3 ) );

			return build;

		}

		const CPK = { h: [ 255, 255, 255 ], he: [ 217, 255, 255 ], li: [ 204, 128, 255 ], be: [ 194, 255, 0 ], b: [ 255, 181, 181 ], c: [ 144, 144, 144 ], n: [ 48, 80, 248 ], o: [ 255, 13, 13 ], f: [ 144, 224, 80 ], ne: [ 179, 227, 245 ], na: [ 171, 92, 242 ], mg: [ 138, 255, 0 ], al: [ 191, 166, 166 ], si: [ 240, 200, 160 ], p: [ 255, 128, 0 ], s: [ 255, 255, 48 ], cl: [ 31, 240, 31 ], ar: [ 128, 209, 227 ], k: [ 143, 64, 212 ], ca: [ 61, 255, 0 ], sc: [ 230, 230, 230 ], ti: [ 191, 194, 199 ], v: [ 166, 166, 171 ], cr: [ 138, 153, 199 ], mn: [ 156, 122, 199 ], fe: [ 224, 102, 51 ], co: [ 240, 144, 160 ], ni: [ 80, 208, 80 ], cu: [ 200, 128, 51 ], zn: [ 125, 128, 176 ], ga: [ 194, 143, 143 ], ge: [ 102, 143, 143 ], as: [ 189, 128, 227 ], se: [ 255, 161, 0 ], br: [ 166, 41, 41 ], kr: [ 92, 184, 209 ], rb: [ 112, 46, 176 ], sr: [ 0, 255, 0 ], y: [ 148, 255, 255 ], zr: [ 148, 224, 224 ], nb: [ 115, 194, 201 ], mo: [ 84, 181, 181 ], tc: [ 59, 158, 158 ], ru: [ 36, 143, 143 ], rh: [ 10, 125, 140 ], pd: [ 0, 105, 133 ], ag: [ 192, 192, 192 ], cd: [ 255, 217, 143 ], in: [ 166, 117, 115 ], sn: [ 102, 128, 128 ], sb: [ 158, 99, 181 ], te: [ 212, 122, 0 ], i: [ 148, 0, 148 ], xe: [ 66, 158, 176 ], cs: [ 87, 23, 143 ], ba: [ 0, 201, 0 ], la: [ 112, 212, 255 ], ce: [ 255, 255, 199 ], pr: [ 217, 255, 199 ], nd: [ 199, 255, 199 ], pm: [ 163, 255, 199 ], sm: [ 143, 255, 199 ], eu: [ 97, 255, 199 ], gd: [ 69, 255, 199 ], tb: [ 48, 255, 199 ], dy: [ 31, 255, 199 ], ho: [ 0, 255, 156 ], er: [ 0, 230, 117 ], tm: [ 0, 212, 82 ], yb: [ 0, 191, 56 ], lu: [ 0, 171, 36 ], hf: [ 77, 194, 255 ], ta: [ 77, 166, 255 ], w: [ 33, 148, 214 ], re: [ 38, 125, 171 ], os: [ 38, 102, 150 ], ir: [ 23, 84, 135 ], pt: [ 208, 208, 224 ], au: [ 255, 209, 35 ], hg: [ 184, 184, 208 ], tl: [ 166, 84, 77 ], pb: [ 87, 89, 97 ], bi: [ 158, 79, 181 ], po: [ 171, 92, 0 ], at: [ 117, 79, 69 ], rn: [ 66, 130, 150 ], fr: [ 66, 0, 102 ], ra: [ 0, 125, 0 ], ac: [ 112, 171, 250 ], th: [ 0, 186, 255 ], pa: [ 0, 161, 255 ], u: [ 0, 143, 255 ], np: [ 0, 128, 255 ], pu: [ 0, 107, 255 ], am: [ 84, 92, 242 ], cm: [ 120, 92, 227 ], bk: [ 138, 79, 227 ], cf: [ 161, 54, 212 ], es: [ 179, 31, 212 ], fm: [ 179, 31, 186 ], md: [ 179, 13, 166 ], no: [ 189, 13, 135 ], lr: [ 199, 0, 102 ], rf: [ 204, 0, 89 ], db: [ 209, 0, 79 ], sg: [ 217, 0, 69 ], bh: [ 224, 0, 56 ], hs: [ 230, 0, 46 ], mt: [ 235, 0, 38 ], ds: [ 235, 0, 38 ], rg: [ 235, 0, 38 ], cn: [ 235, 0, 38 ], uut: [ 235, 0, 38 ], uuq: [ 235, 0, 38 ], uup: [ 235, 0, 38 ], uuh: [ 235, 0, 38 ], uus: [ 235, 0, 38 ], uuo: [ 235, 0, 38 ] };

		// const RADII = { h: 1.20, c: 1.70, n: 1.55, o: 1.52, si: 2.10 };
		const RADII = { h: 0.35, c: 0.80, n: 0.75, o: 0.65, si: 1.20, ga: 1.25 };

		const atoms = [];

		const _bonds = [];
		const _bhash = {};
		const _atomMap = {};

		const lattice = [];

		// parse

		const lines = text.split( '\n' );

		let iformat = 'PDB'
		for ( let i = 0, l = lines.length; i < l; i ++ ) {
			if ( lines[i].indexOf("_cell_length_a") >= 0 ) {
				iformat = 'CIF';
				break;
			}
		}

		if ( iformat === 'CIF' ) {

			let a1,a2,a3,b1,b2,b3;
			let ipos_type,ipos_fract_x,ipos_fract_y,ipos_fract_z,npos;

			for ( let i = 0, l = lines.length; i < l; i ++ ) {
				const tline = trim( lines[i] );
				console.log(tline);
				if ( tline.substr( 0, 14 ) === '_cell_length_a' ) {
					const str = tline.split(/\s\s*/);
					a1 = parseFloat( str[1] );
				} else if ( tline.substr( 0, 14 ) === '_cell_length_b' ) {
					const str = tline.split(/\s\s*/);
					a2 = parseFloat( str[1] );
				} else if ( tline.substr( 0, 14 ) === '_cell_length_c' ) {
					const str = tline.split(/\s\s*/);
					a3 = parseFloat( str[1] );
				} else if ( tline.substr( 0, 17 ) === '_cell_angle_alpha' ) {
					const str = tline.split(/\s\s*/);
					b1 = parseFloat( str[1] );
				} else if ( tline.substr( 0, 16 ) === '_cell_angle_beta'  ) {
					const str = tline.split(/\s\s*/);
					b2 = parseFloat( str[1] );
				} else if ( tline.substr( 0, 17 ) === '_cell_angle_gamma' ) {
					const str = tline.split(/\s\s*/);
					b3 = parseFloat( str[1] );
				}
			}

			// const alat1 = [a1,  0.0,  0.0];  
			// let x = Math.cos(b3*Math.PI/180.0)*a2;
			// if ( Math.abs(x) < 1e-8 ) { x = 0.0; }
			// let y = Math.sqrt(a2**2-x**2);
			// if ( Math.abs(y) < 1e-8 ) { y = 0.0; }
			// const alat2 = [ x, y, 0.0 ];
			// x = Math.cos(b2*Math.PI/180.0)*a3;
			// if ( Math.abs(x) < 1e-8 ) { x = 0.0; }
			// y = ( Math.cos(b1*Math.PI/180.0)*a2*a3 - alat2[0]*x )/alat2[1];
			// if ( Math.abs(y) < 1e-8 ) { y = 0.0; }
			// let z = Math.sqrt( a3**2 - x**2 - y**2 );
			// if ( Math.abs(z) < 1e-8 ) { z = 0.0; }
			// const alat3 = [ x, y, z ];

			const alat1 = [a1,  0.0,  0.0];  
			let x = Math.cos(b3*Math.PI/180.0)*a2;
			if ( Math.abs(x) < 1e-8 ) { x = 0.0; }
			let y = Math.sqrt(a2**2-x**2);
			if ( Math.abs(y) < 1e-8 ) { y = 0.0; }
			const alat2 = [ x, 0.0, y ];
			x = Math.cos(b2*Math.PI/180.0)*a3;
			if ( Math.abs(x) < 1e-8 ) { x = 0.0; }
			y = ( Math.cos(b1*Math.PI/180.0)*a2*a3 - alat2[0]*x )/alat2[2];
			if ( Math.abs(y) < 1e-8 ) { y = 0.0; }
			let z = Math.sqrt( a3**2 - x**2 - y**2 );
			if ( Math.abs(z) < 1e-8 ) { z = 0.0; }
			const alat3 = [ x, z, y ];
			
			lattice.push( alat1, alat2, alat3 );

			for ( let i = 0, l = lines.length; i < l; i ++ ) {

				const tline = trim( lines[i] );

				if ( tline.substr( 0, 5 ) === 'loop_' ) {

					let j = 1;
					let tline_next = trim( lines[i+j] );
					while ( tline_next.substr( 0, 10 ) === '_atom_site' ) {
						if ( tline_next.substr( 10, 12 ) == '_type_symbol') {
							ipos_type = j-1;
						} else if ( tline_next.substr( 10, 8 ) == '_fract_x') {
							ipos_fract_x = j-1;
						} else if ( tline_next.substr( 10, 8 ) == '_fract_y') {
							ipos_fract_y = j-1;
						} else if ( tline_next.substr( 10, 8 ) == '_fract_z') {
							ipos_fract_z = j-1;
						}
						j++;
						tline_next = trim( lines[i+j] );
					}
					npos = j-1;

					if ( npos > 0 ) {
						const natoms = lines.length - (i+npos+2);
						let index = 0;
						for ( j = i+npos+1; j < i+npos+natoms+1; j++ ) {
						 	tline_next = trim( lines[j] );
							const str = tline_next.split(/\s\s*/);
							let e = str[ipos_type].toLowerCase();
							let f1 = parseFloat( str[ipos_fract_x] );
							let f2 = parseFloat( str[ipos_fract_y] );
							let f3 = parseFloat( str[ipos_fract_z] );
							if ( Math.abs(f1) < 1e-8 ) { f1=0.0; }
							if ( Math.abs(f2) < 1e-8 ) { f2=0.0; }
							if ( Math.abs(f3) < 1e-8 ) { f3=0.0; }
							if ( Math.abs(1.0-f1) < 1e-2 ) { f1=1.0; }
							if ( Math.abs(1.0-f2) < 1e-2 ) { f2=1.0; }
							if ( Math.abs(1.0-f3) < 1e-2 ) { f3=1.0; }
							const x = alat1[0]*f1 + alat2[0]*f2 + alat3[0]*f3;
							const y = alat1[1]*f1 + alat2[1]*f2 + alat3[1]*f3;
							const z = alat1[2]*f1 + alat2[2]*f2 + alat3[2]*f3;
							const atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
							atoms.push( atomData );
							_atomMap[ index ] = atomData;
							index++;
						}

						for ( j = i+npos+1; j < i+npos+natoms+1; j++ ) {
							tline_next = trim( lines[j] );
						  	const str = tline_next.split(/\s\s*/);
						   	let e = str[ipos_type].toLowerCase();
							let f1 = parseFloat( str[ipos_fract_x] );
							let f2 = parseFloat( str[ipos_fract_y] );
							let f3 = parseFloat( str[ipos_fract_z] );
							if ( Math.abs(f1) < 1e-8 ) { f1=0.0; }
							if ( Math.abs(f2) < 1e-8 ) { f2=0.0; }
							if ( Math.abs(f3) < 1e-8 ) { f3=0.0; }
							if ( Math.abs(1.0-f1) < 1e-2 ) { f1=1.0; }
							if ( Math.abs(1.0-f2) < 1e-2 ) { f2=1.0; }
							if ( Math.abs(1.0-f3) < 1e-2 ) { f3=1.0; }
							if ( f1 === 0.0 && f2 !== 0.0 && f3 !== 0.0 ) {
								const ff1 = f1 + 1.0;
								const x = alat1[0]*ff1 + alat2[0]*f2 + alat3[0]*f3
								const y = alat1[1]*ff1 + alat2[1]*f2 + alat3[1]*f3
								const z = alat1[2]*ff1 + alat2[2]*f2 + alat3[2]*f3
								const atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
							}
							if ( f2 === 0.0 && f3 !== 0.0 && f1 !== 0.0 ) {
								const ff2 = f2 + 1.0;
								const x = alat1[0]*f1 + alat2[0]*ff2 + alat3[0]*f3
								const y = alat1[1]*f1 + alat2[1]*ff2 + alat3[1]*f3
								const z = alat1[2]*f1 + alat2[2]*ff2 + alat3[2]*f3
								const atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
							}
							if ( f3 === 0.0 && f1 !== 0.0 && f2 !== 0.0 ) {
								const ff3 = f3 + 1.0;
								const x = alat1[0]*f1 + alat2[0]*f2 + alat3[0]*ff3;
								const y = alat1[1]*f1 + alat2[1]*f2 + alat3[1]*ff3;
								const z = alat1[2]*f1 + alat2[2]*f2 + alat3[2]*ff3;
								const atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
							}
							if ( f1 === 0.0 && f2 === 0.0 && f3 !== 0.0 ) {
								let ff1,ff2,x,y,z,atomData;
								ff1 = f1 + 1.0;
								ff2 = f2;
								x = alat1[0]*ff1 + alat2[0]*ff2 + alat3[0]*f3;
								y = alat1[1]*ff1 + alat2[1]*ff2 + alat3[1]*f3;
								z = alat1[2]*ff1 + alat2[2]*ff2 + alat3[2]*f3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff1 = f1;
								ff2 = f2 + 1.0;
								x = alat1[0]*ff1 + alat2[0]*ff2 + alat3[0]*f3;
								y = alat1[1]*ff1 + alat2[1]*ff2 + alat3[1]*f3;
								z = alat1[2]*ff1 + alat2[2]*ff2 + alat3[2]*f3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff1 = f1 + 1.0;
								ff2 = f2 + 1.0;
								x = alat1[0]*ff1 + alat2[0]*ff2 + alat3[0]*f3;
								y = alat1[1]*ff1 + alat2[1]*ff2 + alat3[1]*f3;
								z = alat1[2]*ff1 + alat2[2]*ff2 + alat3[2]*f3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
							}
							if ( f1 === 0.0 && f3 === 0.0 && f2 !== 0.0 ) {
								let ff1,ff3,x,y,z,atomData;
								ff1 = f1 + 1.0;
								ff3 = f3;
								x = alat1[0]*ff1 + alat2[0]*f2 + alat3[0]*ff3;
								y = alat1[1]*ff1 + alat2[1]*f2 + alat3[1]*ff3;
								z = alat1[2]*ff1 + alat2[2]*f2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff1 = f1;
								ff3 = f3 + 1.0;
								x = alat1[0]*ff1 + alat2[0]*f2 + alat3[0]*ff3;
								y = alat1[1]*ff1 + alat2[1]*f2 + alat3[1]*ff3;
								z = alat1[2]*ff1 + alat2[2]*f2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff1 = f1 + 1.0;
								ff3 = f3 + 1.0;
								x = alat1[0]*ff1 + alat2[0]*f2 + alat3[0]*ff3;
								y = alat1[1]*ff1 + alat2[1]*f2 + alat3[1]*ff3;
								z = alat1[2]*ff1 + alat2[2]*f2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
							}
							if ( f2 === 0.0 && f3 === 0.0 && f1 !== 0.0 ) {
								let ff2,ff3,x,y,z,atomData;
								ff2 = f2 + 1.0;
								ff3 = f3;
								x = alat1[0]*f1 + alat2[0]*ff2 + alat3[0]*ff3;
								y = alat1[1]*f1 + alat2[1]*ff2 + alat3[1]*ff3;
								z = alat1[2]*f1 + alat2[2]*ff2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff2 = f2;
								ff3 = f3 + 1.0;
								x = alat1[0]*f1 + alat2[0]*ff2 + alat3[0]*ff3;
								y = alat1[1]*f1 + alat2[1]*ff2 + alat3[1]*ff3;
								z = alat1[2]*f1 + alat2[2]*ff2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff2 = f2 + 1.0;
								ff3 = f3 + 1.0;
								x = alat1[0]*f1 + alat2[0]*ff2 + alat3[0]*ff3;
								y = alat1[1]*f1 + alat2[1]*ff2 + alat3[1]*ff3;
								z = alat1[2]*f1 + alat2[2]*ff2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
							}
							if ( f1 === 0.0 && f2 === 0.0 && f3 === 0.0 ) {
								let ff1,ff2,ff3,x,y,z,atomData;
								ff1 = f1 + 1.0;
								ff2 = f2;
								ff3 = f3;
								x = alat1[0]*ff1 + alat2[0]*ff2 + alat3[0]*ff3;
								y = alat1[1]*ff1 + alat2[1]*ff2 + alat3[1]*ff3;
								z = alat1[2]*ff1 + alat2[2]*ff2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff1 = f1;
								ff2 = f2 + 1.0;
								ff3 = f3;
								x = alat1[0]*ff1 + alat2[0]*ff2 + alat3[0]*ff3;
								y = alat1[1]*ff1 + alat2[1]*ff2 + alat3[1]*ff3;
								z = alat1[2]*ff1 + alat2[2]*ff2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff1 = f1;
								ff2 = f2;
								ff3 = f3 + 1.0;
								x = alat1[0]*ff1 + alat2[0]*ff2 + alat3[0]*ff3;
								y = alat1[1]*ff1 + alat2[1]*ff2 + alat3[1]*ff3;
								z = alat1[2]*ff1 + alat2[2]*ff2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff1 = f1 + 1.0;
								ff2 = f2 + 1.0;
								ff3 = f3;
								x = alat1[0]*ff1 + alat2[0]*ff2 + alat3[0]*ff3;
								y = alat1[1]*ff1 + alat2[1]*ff2 + alat3[1]*ff3;
								z = alat1[2]*ff1 + alat2[2]*ff2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff1 = f1 + 1.0;
								ff2 = f2;
								ff3 = f3 + 1.0;
								x = alat1[0]*ff1 + alat2[0]*ff2 + alat3[0]*ff3;
								y = alat1[1]*ff1 + alat2[1]*ff2 + alat3[1]*ff3;
								z = alat1[2]*ff1 + alat2[2]*ff2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff1 = f1;
								ff2 = f2 + 1.0;
								ff3 = f3 + 1.0;
								x = alat1[0]*ff1 + alat2[0]*ff2 + alat3[0]*ff3;
								y = alat1[1]*ff1 + alat2[1]*ff2 + alat3[1]*ff3;
								z = alat1[2]*ff1 + alat2[2]*ff2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff1 = f1 + 1.0;
								ff2 = f2 + 1.0;
								ff3 = f3 + 1.0;
								x = alat1[0]*ff1 + alat2[0]*ff2 + alat3[0]*ff3;
								y = alat1[1]*ff1 + alat2[1]*ff2 + alat3[1]*ff3;
								z = alat1[2]*ff1 + alat2[2]*ff2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
							}
						}

						for ( j = i+npos+1; j < i+npos+natoms+1; j++ ) {
							tline_next = trim( lines[j] );
						  	const str = tline_next.split(/\s\s*/);
						   	let e = str[ipos_type].toLowerCase();
							let f1 = parseFloat( str[ipos_fract_x] );
							let f2 = parseFloat( str[ipos_fract_y] );
							let f3 = parseFloat( str[ipos_fract_z] );
							if ( Math.abs(f1) < 1e-8 ) { f1=0.0; }
							if ( Math.abs(f2) < 1e-8 ) { f2=0.0; }
							if ( Math.abs(f3) < 1e-8 ) { f3=0.0; }
							if ( Math.abs(1.0-f1) < 1e-2 ) { f1=1.0; }
							if ( Math.abs(1.0-f2) < 1e-2 ) { f2=1.0; }
							if ( Math.abs(1.0-f3) < 1e-2 ) { f3=1.0; }
							if ( f1 === 1.0 && f2 !== 1.0 && f3 !== 1.0 ) {
								const ff1 = 0.0;
								const x = alat1[0]*ff1 + alat2[0]*f2 + alat3[0]*f3
								const y = alat1[1]*ff1 + alat2[1]*f2 + alat3[1]*f3
								const z = alat1[2]*ff1 + alat2[2]*f2 + alat3[2]*f3
								const atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
							}
							if ( f2 === 1.0 && f3 !== 1.0 && f1 !== 1.0 ) {
								const ff2 = 0.0;
								const x = alat1[0]*f1 + alat2[0]*ff2 + alat3[0]*f3
								const y = alat1[1]*f1 + alat2[1]*ff2 + alat3[1]*f3
								const z = alat1[2]*f1 + alat2[2]*ff2 + alat3[2]*f3
								const atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
							}
							if ( f3 === 1.0 && f1 !== 1.0 && f2 !== 1.0 ) {
								const ff3 = 0.0;
								const x = alat1[0]*f1 + alat2[0]*f2 + alat3[0]*ff3;
								const y = alat1[1]*f1 + alat2[1]*f2 + alat3[1]*ff3;
								const z = alat1[2]*f1 + alat2[2]*f2 + alat3[2]*ff3;
								const atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
							}
							if ( f1 === 1.0 && f2 === 1.0 && f3 !== 1.0 ) {
								let ff1,ff2,x,y,z,atomData;
								ff1 = 0.0;
								ff2 = f2;
								x = alat1[0]*ff1 + alat2[0]*ff2 + alat3[0]*f3;
								y = alat1[1]*ff1 + alat2[1]*ff2 + alat3[1]*f3;
								z = alat1[2]*ff1 + alat2[2]*ff2 + alat3[2]*f3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff1 = f1;
								ff2 = 0.0;
								x = alat1[0]*ff1 + alat2[0]*ff2 + alat3[0]*f3;
								y = alat1[1]*ff1 + alat2[1]*ff2 + alat3[1]*f3;
								z = alat1[2]*ff1 + alat2[2]*ff2 + alat3[2]*f3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff1 = 0.0;
								ff2 = 0.0;
								x = alat1[0]*ff1 + alat2[0]*ff2 + alat3[0]*f3;
								y = alat1[1]*ff1 + alat2[1]*ff2 + alat3[1]*f3;
								z = alat1[2]*ff1 + alat2[2]*ff2 + alat3[2]*f3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
							}
							if ( f1 === 1.0 && f3 === 1.0 && f2 !== 1.0 ) {
								let ff1,ff3,x,y,z,atomData;
								ff1 = 0.0;
								ff3 = f3;
								x = alat1[0]*ff1 + alat2[0]*f2 + alat3[0]*ff3;
								y = alat1[1]*ff1 + alat2[1]*f2 + alat3[1]*ff3;
								z = alat1[2]*ff1 + alat2[2]*f2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff1 = f1;
								ff3 = 0.0;
								x = alat1[0]*ff1 + alat2[0]*f2 + alat3[0]*ff3;
								y = alat1[1]*ff1 + alat2[1]*f2 + alat3[1]*ff3;
								z = alat1[2]*ff1 + alat2[2]*f2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff1 = 0.0;
								ff3 = 0.0;
								x = alat1[0]*ff1 + alat2[0]*f2 + alat3[0]*ff3;
								y = alat1[1]*ff1 + alat2[1]*f2 + alat3[1]*ff3;
								z = alat1[2]*ff1 + alat2[2]*f2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
							}
							if ( f2 === 1.0 && f3 === 1.0 && f1 !== 1.0 ) {
								let ff2,ff3,x,y,z,atomData;
								ff2 = 0.0;
								ff3 = f3;
								x = alat1[0]*f1 + alat2[0]*ff2 + alat3[0]*ff3;
								y = alat1[1]*f1 + alat2[1]*ff2 + alat3[1]*ff3;
								z = alat1[2]*f1 + alat2[2]*ff2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff2 = f2;
								ff3 = 0.0;
								x = alat1[0]*f1 + alat2[0]*ff2 + alat3[0]*ff3;
								y = alat1[1]*f1 + alat2[1]*ff2 + alat3[1]*ff3;
								z = alat1[2]*f1 + alat2[2]*ff2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff2 = 0.0;
								ff3 = 0.0;
								x = alat1[0]*f1 + alat2[0]*ff2 + alat3[0]*ff3;
								y = alat1[1]*f1 + alat2[1]*ff2 + alat3[1]*ff3;
								z = alat1[2]*f1 + alat2[2]*ff2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
							}
							if ( f1 === 1.0 && f2 === 1.0 && f3 === 1.0 ) {
								let ff1,ff2,ff3,x,y,z,atomData;
								ff1 = 0.0;
								ff2 = f2;
								ff3 = f3;
								x = alat1[0]*ff1 + alat2[0]*ff2 + alat3[0]*ff3;
								y = alat1[1]*ff1 + alat2[1]*ff2 + alat3[1]*ff3;
								z = alat1[2]*ff1 + alat2[2]*ff2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff1 = f1;
								ff2 = 0.0;
								ff3 = f3;
								x = alat1[0]*ff1 + alat2[0]*ff2 + alat3[0]*ff3;
								y = alat1[1]*ff1 + alat2[1]*ff2 + alat3[1]*ff3;
								z = alat1[2]*ff1 + alat2[2]*ff2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff1 = f1;
								ff2 = f2;
								ff3 = 0.0;
								x = alat1[0]*ff1 + alat2[0]*ff2 + alat3[0]*ff3;
								y = alat1[1]*ff1 + alat2[1]*ff2 + alat3[1]*ff3;
								z = alat1[2]*ff1 + alat2[2]*ff2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff1 = 0.0;
								ff2 = 0.0;
								ff3 = f3;
								x = alat1[0]*ff1 + alat2[0]*ff2 + alat3[0]*ff3;
								y = alat1[1]*ff1 + alat2[1]*ff2 + alat3[1]*ff3;
								z = alat1[2]*ff1 + alat2[2]*ff2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff1 = 0.0;
								ff2 = f2;
								ff3 = 0.0;
								x = alat1[0]*ff1 + alat2[0]*ff2 + alat3[0]*ff3;
								y = alat1[1]*ff1 + alat2[1]*ff2 + alat3[1]*ff3;
								z = alat1[2]*ff1 + alat2[2]*ff2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff1 = f1;
								ff2 = 0.0;
								ff3 = 0.0;
								x = alat1[0]*ff1 + alat2[0]*ff2 + alat3[0]*ff3;
								y = alat1[1]*ff1 + alat2[1]*ff2 + alat3[1]*ff3;
								z = alat1[2]*ff1 + alat2[2]*ff2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
								ff1 = 0.0;
								ff2 = 0.0;
								ff3 = 0.0;
								x = alat1[0]*ff1 + alat2[0]*ff2 + alat3[0]*ff3;
								y = alat1[1]*ff1 + alat2[1]*ff2 + alat3[1]*ff3;
								z = alat1[2]*ff1 + alat2[2]*ff2 + alat3[2]*ff3;
								atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
								atoms.push( atomData );
								_atomMap[ index ] = atomData;
								index++;
							}
						}

						break;
					}

				}

			}

			for ( let i = 0, natoms = Object.keys(_atomMap).length; i < natoms; i++ ) {
				const ai = _atomMap[i].slice(0,3);
				const ei = _atomMap[i][4].toLowerCase();
				const ri = RADII[ ei ];
				for ( let j = 0; j < i; j++ ) {
					const aj = _atomMap[j].slice(0,3);
					const ej = _atomMap[j][4].toLowerCase();
					const rj = RADII[ ej ];
					let rr = (ai[0]-aj[0])**2 + (ai[1]-aj[1])**2 + (ai[2]-aj[2])**2;
					rr = Math.sqrt(rr);
					if ( rr <= ri+rj ) {
						const h = hash( i+1, j+1 );
						if ( _bhash[ h ] === undefined ) {
							_bonds.push( [i,j,1] );
							_bhash[ h ] = _bonds.length - 1;
						}
					}
				}
			}
		
		} else if ( iformat == 'PDB' ) {

			for ( let i = 0, l = lines.length; i < l; i ++ ) {
		
				if ( lines[ i ].substr( 0, 4 ) === 'ATOM' || lines[ i ].substr( 0, 6 ) === 'HETATM' ) {

					const x = parseFloat( lines[ i ].substr( 30, 7 ) );
					const y = parseFloat( lines[ i ].substr( 38, 7 ) );
					const z = parseFloat( lines[ i ].substr( 46, 7 ) );
					const index = parseInt( lines[ i ].substr( 6, 5 ) ) - 1;

					let e = trim( lines[ i ].substr( 76, 2 ) ).toLowerCase();

					if ( e === '' ) {

						e = trim( lines[ i ].substr( 12, 2 ) ).toLowerCase();

					}

					const atomData = [ x, y, z, CPK[ e ], capitalize( e ) ];
					atoms.push( atomData );
					_atomMap[ index ] = atomData;

				} else if ( lines[ i ].substr( 0, 6 ) === 'CONECT' ) {

					const satom = parseInt( lines[ i ].substr( 6, 5 ) );

					parseBond( 11, 5, satom, i );
					parseBond( 16, 5, satom, i );
					parseBond( 21, 5, satom, i );
					parseBond( 26, 5, satom, i );

				}

			}
		
		}

		// build and return geometry

		return buildGeometry();

	}

}

export { CIFLoader };
