// Project Prime Edition is now the default experience at the original invite URL.
// Existing /?invite=... links and bcc-member-token sessions remain on this origin.
// The previous homepage is preserved in backup/pre-prime-homepage-cutover-2026-11-09
// and in production deployment dpl_oKPi6ShT69dSfdjyftmPz1hSoitH.
import ProjectPrime from './v2/page';

export default function Home(){
 return <ProjectPrime/>;
}
