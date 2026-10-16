  414b95:	8b cf                	mov    ecx,edi
  414b97:	e8 94 02 00 00       	call   0x414e30
  414b9c:	80 bf fb 00 00 00 01 	cmp    BYTE PTR [edi+0xfb],0x1
  414ba3:	0f 85 f8 00 00 00    	jne    0x414ca1
  414ba9:	6a 57                	push   0x57
  414bab:	8d 45 a5             	lea    eax,[ebp-0x5b]
  414bae:	6a 00                	push   0x0
  414bb0:	50                   	push   eax
  414bb1:	e8 5d 4c 00 00       	call   0x419813
  414bb6:	8b b7 24 87 07 00    	mov    esi,DWORD PTR [edi+0x78724]
  414bbc:	b8 09 00 00 00       	mov    eax,0x9
  414bc1:	83 c4 0c             	add    esp,0xc
  414bc4:	8b 8e 24 09 00 00    	mov    ecx,DWORD PTR [esi+0x924]
  414bca:	8b 9e 4c 09 00 00    	mov    ebx,DWORD PTR [esi+0x94c]
  414bd0:	8a d3                	mov    dl,bl
  414bd2:	2b 86 28 09 00 00    	sub    eax,DWORD PTR [esi+0x928]
  414bd8:	89 4d 88             	mov    DWORD PTR [ebp-0x78],ecx
  414bdb:	8b 8e 30 09 00 00    	mov    ecx,DWORD PTR [esi+0x930]
  414be1:	89 4d 8c             	mov    DWORD PTR [ebp-0x74],ecx
  414be4:	8b 8e 2c 09 00 00    	mov    ecx,DWORD PTR [esi+0x92c]
  414bea:	8a f1                	mov    dh,cl
  414bec:	80 e6 f0             	and    dh,0xf0
  414bef:	c0 e2 04             	shl    dl,0x4
  414bf2:	0a f0                	or     dh,al
  414bf4:	66 c7 45 98 05 0f    	mov    WORD PTR [ebp-0x68],0xf05
  414bfa:	c6 45 9a 01          	mov    BYTE PTR [ebp-0x66],0x1
  414bfe:	88 55 97             	mov    BYTE PTR [ebp-0x69],dl
  414c01:	88 55 9b             	mov    BYTE PTR [ebp-0x65],dl
  414c04:	88 75 9c             	mov    BYTE PTR [ebp-0x64],dh
  414c07:	83 fb 01             	cmp    ebx,0x1
  414c0a:	74 0d                	je     0x414c19
  414c0c:	83 fb 09             	cmp    ebx,0x9
  414c0f:	74 08                	je     0x414c19
  414c11:	c0 e1 04             	shl    cl,0x4
  414c14:	80 c9 08             	or     cl,0x8
  414c17:	eb 06                	jmp    0x414c1f
  414c19:	c0 e1 04             	shl    cl,0x4
  414c1c:	0a 4d 88             	or     cl,BYTE PTR [ebp-0x78]
  414c1f:	8b 45 8c             	mov    eax,DWORD PTR [ebp-0x74]
  414c22:	88 4d 9d             	mov    BYTE PTR [ebp-0x63],cl
  414c25:	89 4d 90             	mov    DWORD PTR [ebp-0x70],ecx
  414c28:	8a ae 5c 09 00 00    	mov    ch,BYTE PTR [esi+0x95c]
  414c2e:	88 6d 9e             	mov    BYTE PTR [ebp-0x62],ch
  414c31:	8a 9e 5d 09 00 00    	mov    bl,BYTE PTR [esi+0x95d]
  414c37:	88 5d 9f             	mov    BYTE PTR [ebp-0x61],bl
  414c3a:	8a 96 5e 09 00 00    	mov    dl,BYTE PTR [esi+0x95e]
  414c40:	88 45 a1             	mov    BYTE PTR [ebp-0x5f],al
  414c43:	88 55 a0             	mov    BYTE PTR [ebp-0x60],dl
  414c46:	8a 8e 58 09 00 00    	mov    cl,BYTE PTR [esi+0x958]
  414c4c:	0f b6 f0             	movzx  esi,al
  414c4f:	0f b6 c6             	movzx  eax,dh
  414c52:	66 03 f0             	add    si,ax
  414c55:	88 4d a2             	mov    BYTE PTR [ebp-0x5e],cl
  414c58:	0f b6 45 97          	movzx  eax,BYTE PTR [ebp-0x69]
  414c5c:	66 03 f0             	add    si,ax
  414c5f:	8b 45 90             	mov    eax,DWORD PTR [ebp-0x70]
  414c62:	0f b6 c0             	movzx  eax,al
  414c65:	66 03 f0             	add    si,ax
  414c68:	0f b6 c1             	movzx  eax,cl
  414c6b:	66 03 f0             	add    si,ax
  414c6e:	0f b6 c2             	movzx  eax,dl
  414c71:	66 03 f0             	add    si,ax
  414c74:	0f b6 c3             	movzx  eax,bl
  414c77:	66 03 f0             	add    si,ax
  414c7a:	0f b6 c5             	movzx  eax,ch
  414c7d:	66 03 f0             	add    si,ax
  414c80:	0f b7 ce             	movzx  ecx,si
  414c83:	8b c1                	mov    eax,ecx
  414c85:	88 4d a4             	mov    BYTE PTR [ebp-0x5c],cl
  414c88:	c1 e8 08             	shr    eax,0x8
  414c8b:	8b cf                	mov    ecx,edi
  414c8d:	88 45 a3             	mov    BYTE PTR [ebp-0x5d],al
  414c90:	8d 45 98             	lea    eax,[ebp-0x68]
  414c93:	6a 0f                	push   0xf
  414c95:	50                   	push   eax
  414c96:	e8 f5 f6 ff ff       	call   0x414390
  414c9b:	8d b7 d0 32 08 00    	lea    esi,[edi+0x832d0]
  414ca1:	80 bf f6 00 00 00 01 	cmp    BYTE PTR [edi+0xf6],0x1
  414ca8:	75 63                	jne    0x414d0d
  414caa:	6a 5f                	push   0x5f
  414cac:	8d 45 9d             	lea    eax,[ebp-0x63]
  414caf:	6a 00                	push   0x0
  414cb1:	50                   	push   eax
  414cb2:	e8 5c 4b 00 00       	call   0x419813
  414cb7:	8b 87 24 87 07 00    	mov    eax,DWORD PTR [edi+0x78724]
  414cbd:	83 c4 0c             	add    esp,0xc
  414cc0:	b9 02 00 00 00       	mov    ecx,0x2
  414cc5:	8b 80 38 09 00 00    	mov    eax,DWORD PTR [eax+0x938]
  414ccb:	85 c0                	test   eax,eax
  414ccd:	75 05                	jne    0x414cd4
  414ccf:	8d 48 08             	lea    ecx,[eax+0x8]
  414cd2:	eb 1a                	jmp    0x414cee
  414cd4:	83 f8 01             	cmp    eax,0x1
  414cd7:	75 05                	jne    0x414cde
  414cd9:	8d 48 03             	lea    ecx,[eax+0x3]
  414cdc:	eb 10                	jmp    0x414cee
  414cde:	83 f8 02             	cmp    eax,0x2
  414ce1:	74 0b                	je     0x414cee
  414ce3:	83 f8 03             	cmp    eax,0x3
  414ce6:	ba 01 00 00 00       	mov    edx,0x1
  414ceb:	0f 44 ca             	cmove  ecx,edx
  414cee:	88 4d 9b             	mov    BYTE PTR [ebp-0x65],cl
  414cf1:	8d 45 98             	lea    eax,[ebp-0x68]
  414cf4:	f6 d1                	not    cl
  414cf6:	66 c7 45 98 06 09    	mov    WORD PTR [ebp-0x68],0x906
  414cfc:	6a 09                	push   0x9
  414cfe:	88 4d 9c             	mov    BYTE PTR [ebp-0x64],cl
  414d01:	8b cf                	mov    ecx,edi
  414d03:	50                   	push   eax
  414d04:	c6 45 9a 01          	mov    BYTE PTR [ebp-0x66],0x1
  414d08:	e8 83 f6 ff ff       	call   0x414390
  414d0d:	80 bf 00 01 00 00 01 	cmp    BYTE PTR [edi+0x100],0x1
  414d14:	75 08                	jne    0x414d1e
