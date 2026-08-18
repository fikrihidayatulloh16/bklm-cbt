// apps/api/src/schools/entities/school.entity.ts
export type SchoolSubscription = 'FREE' | 'PREMIUM';

export class SchoolDomain {
    constructor (
        public _id: string,
        public _name: string,
        public _subscription: SchoolSubscription = 'FREE',
        public _user?: string,
        public _assessments?: string,
        public _class?: string,
    ) {}
    //Getter
    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get subscription(): SchoolSubscription {
        return this._subscription;
    }

    public static createNewSchool(name: string): SchoolDomain {
        // Validasi bisnis sederhana bisa dimasukkan ke sini
        if (!name || name.trim() === '') {
            throw new Error("Nama sekolah tidak boleh kosong");
        }
        
        // ID dikosongkan karena nanti Prisma yang akan membuat UUID-nya
        return new SchoolDomain('', name, 'FREE');
    }

    // B. Factory untuk merekonstruksi data DARI Database (Sudah ada ID-nya)
    public static reconstitute(
        id: string, 
        name: string, 
        subscription: SchoolSubscription
    ): SchoolDomain {
        return new SchoolDomain(id, name, subscription);
    }

    // ==============================================
    // 4. BEHAVIORS (Fungsi untuk mengubah data/Aturan Bisnis)
    // ==============================================
    
    // Contoh: Fungsi untuk upgrade langganan
    public upgradeToPremium(): void {
        if (this._subscription === 'PREMIUM') {
            throw new Error("Sekolah ini sudah berlangganan Premium");
        }
        this._subscription = 'PREMIUM';
    }

    // Contoh: Fungsi untuk ganti nama dengan validasi
    public updateName(newName: string): void {
         if (newName.length < 3) {
             throw new Error("Nama sekolah minimal 3 karakter");
         }
         this._name = newName;
    }
}