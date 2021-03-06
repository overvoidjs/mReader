'use strict'
import Path from 'path'
import {ComicExt, BookExt} from './../../conf'
import {ReadFile, ListFiles, WriteFile} from './util'
import {Book} from './book'

export function AddLibrary (path) {
  console.log(path)
  let libpath = Path.join(global.DataPath, 'lib.json')
  return ReadFile(libpath).then((libs) => {
    if (libs) {
      libs = JSON.parse(libs)
      if (!libs.includes(path)) {
        libs = libs.concat(path)
      }
    } else {
      libs = [path]
    }
    return WriteFile(libpath, JSON.stringify(libs)).then(() => {
      return SyncLibrary()
    })
  })
}

export function UpdateLibrary (book) {
  return SyncLibrary().then((lib) => {
    let i = -1
    lib.forEach((b, k) => {
      if (i < 0) {
        if (b.fullPath === book.fullPath & b.type === book.type) {
          i = k
        }
      }
    })
    if (i >= 0) {
      lib[i].author = book.author
      lib[i].name = book.name
      lib[i].info.readOffset = book.info.readOffset
      if (lib[i].info.readOffset >= 95) {
        lib[i].clear()
      }
      lib[i].info.zoom = book.info.zoom
      lib[i].info.font = book.info.font
      lib[i].info.read = book.info.read
      return WriteFile(Path.join(lib[i].dataPath, 'book.info'), JSON.stringify(lib[i])).then(() => {
        return lib
      })
    }
    return lib
  })
}

export function ClearLibrary () {
  console.log('hu')
  return ReadFile(Path.join(global.DataPath, 'lib.json')).then((libs) => {
    return Promise.all(JSON.parse(libs).map((libdir) => {
      return Promise.all(ListFiles(libdir).map((file) => {
        return (new Book({file: file})).clear()
      }))
    }))
  })
}

export function SyncLibrary () {
  let allbooks = []
  return ReadFile(Path.join(global.DataPath, 'lib.json')).then((libs) => {
    if (!libs) {
      return []
    }
    let libpromises = JSON.parse(libs).map((libdir) => {
      let bookpromises = ListFiles(libdir, null, (f) => { return `${BookExt}${ComicExt}`.indexOf(Path.extname(f)) >= 0 }).map((file) => {
        // // console.log(libdir, file)
        return new Book().parse(libdir, file)
      })
      return Promise.all(bookpromises)
    })
    return Promise.all(libpromises)
  }).then((books) => {
    books.forEach((b) => {
      allbooks = allbooks.concat(b)
    })
    return allbooks
  })
  //     })).then((a) => {
  //       // console.log('fuu')
  //       // console.log(a)
  //     })
  //   })).then((books) => {
  //     // console.log('kkkuu')
  //     // console.log(books)
  //     books.forEach((b) => {
  //       allbooks = allbooks.concat(b)
  //     })
  //     return allbooks
  //   })
  // })
}
