import { KelzFormatParser } from "./kelzFormatParser";

export const ImportConfig = [
  {
    name: "HSR-Scanner",
    author: "Kel-z",
    homepage: "https://github.com/kel-z/HSR-Scanner",
    releases: "https://github.com/kel-z/HSR-Scanner/releases",
    parser: new KelzFormatParser("v0.6.2", "HSR-Scanner")
  },
  {
    name: "Reliquary Archiver",
    author: "IceDynamix",
    homepage: "https://github.com/IceDynamix/reliquary-archiver",
    releases: "https://github.com/IceDynamix/reliquary-archiver/releases",
    parser: new KelzFormatParser("v0.1.1", "reliquary_archiver")
  }
]